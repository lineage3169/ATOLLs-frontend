<template>
    <div class="m-search">
        <Content class="content-container">
            <div class="info-bar" v-show="dataPool.length > 0">
                <Pagination ref="pagination"
                            v-model="pageIndex"
                            :data-length="data.length"
                            :data-pool-length="dataPool.length"
                            :limit="pageLimit"
                            @reflash-limit="setPagination"/>
                <div class="info-bar__total-records">
                    {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
                </div>
                <span class="info-bar--warning" v-show="hasUnfilled">{{$t('HasUnfilledWarring')}}</span>
                <Button class="btn btn--export fz--large"
                        @click="exportExcel()">
                        <Icon type="md-download" />
                        {{ $t('Export') }}
                </Button>
            </div>
            <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                    ref="table"
                    stripe
                    class="table"
                    max-height="600"
                    no-data-text="No data"
                    :columns="columns"
                    :data="data[pageIndex]"
                    :row-class-name="rowClassName"/>
            <div class="info-bar" v-show="dataPool.length > 0">
                <Pagination v-model="pageIndex"
                            :data-length="data.length"
                            :data-pool-length="dataPool.length"
                            :limit="pageLimit"
                            @reflash-limit="setPagination"/>
                <div class="info-bar__total-records">
                    {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
                </div>
            </div>
            <div class="error-msg"
                 v-if="errorMsg">
                {{errorMsg}}
            </div>
        </Content>
         <Modal v-model="showModal" width="500">
            <h3 slot="header" class="header fz--large">
                {{$t('Change')+$t('InsPolicy&Form')}}
            </h3>
            <div v-if="selectedPolicy" class="modal__content">
                <div class="modal__items mb-20">
                    <div class="modal__items__title fz--large">{{$t('InsPolicy&Form')+$t('NumberA')}}</div>
                    <div class="modal__items__content fz--primary">
                        {{selectedPolicy.object_id}}
                    </div>
                </div>
                <div class="modal__items mb-20">
                    <div class="modal__items__title fz--large">{{$t('RegisterNumber')}}</div>
                    <div class="modal__items__content fz--primary">
                        <Input type="text" class="w-250" :placeholder="$t('PlaceHolder.PleaseTypeRegisterNumber')" v-model="registerNumber" />
                    </div>
                </div>
            </div>
            <div slot="footer">
                <Button class="btn btn--outline fz--primary mr-5"
                        @click.stop="resetRegisterNum()">
                    {{$t('Reset')}}
                </Button>
                <Button class="btn fz--primary"
                        :disabled="handleBtnVerify()"
                        @click.stop="updateOperation()"
                        :loading="apiLoading">
                    {{$t('Change')}}
                </Button>
            </div>
        </Modal>
        <Modal v-model="showConfirmModal" width="400">
            <h3 slot="header" class="header fz--large">
                {{$t('WARNING')}}
            </h3>
            <p  class="fz--primary"
                style="padding: 30px 0px;color: rgb(219, 0, 0);">{{$t('ModalWarringUnfilled')}}</p>
            <div slot="footer">
                <Button class="btn btn--outline fz--primary mr-5"
                        @click.stop="showConfirmModal = false"
                        :loading="apiLoading">
                    {{$t('Cancel')}}
                </Button>
                <Button class="btn fz--primary"
                        @click.stop="exportData()"
                        :loading="apiLoading">
                    {{$t('OK')}}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import Pagination from '@/components/pagination.vue'
import columns from './columns/operation-list'
export default {
    name: 'SearchOperationList',
    components: { Pagination },
    data() {
        return {
            apiLoading: false,
            columns: columns(this),
            data: [],
            dataPool: [],
            excelFields: {},
            errorMsg: null,
            statusFilters: [],
            showModal: false,
            statusNameMap: this.$store.state.statusNameMap,
            billCateNameMap: this.$store.state.billCateNameMap,
            extendColumns: [],
            selectedPolicy: null,
            registerNumber: null,
            showWaring: false,
            showConfirmModal: false,
            hasUnfilled: false,
            cycleDates: [],
            pageIndex: 0,
            pageLimit: 10,
            totalRecords: 0,
            packageCodeMap: null
        }
    },
    created() {
        this.getOperations()
        this.setExtendColumn()
    },
    methods: {
        getOperations() {
            this.$Loading.config({
                color: '#4FACBF',
                height: 5
            })
            this.resetData()
            this.$Loading.start()
            const config = {
                method: 'get',
                path: '/1/ins/c/operation/get/',
                success: this.getOperationsSuccess,
                error: this.getOperationsError
            }
            this.ajax(config)
        },
        async getOperationsSuccess(response) {
            this.$Loading.finish()
            if (!response.data || !response.data.data)
                return
            const data = this.setInitData(response.data.data)
            if (data.length === 0) {
                this.errorMsg = this.$t('NoData')
                return
            }
            // 分類: 變更地址 / 其他
            const filterData = data
                .reduce((acc, crr) => {
                    if (crr.changes && crr.changes.update_address)
                        acc.changeAddress.push(crr)
                    else acc.others.push(crr)
                    return acc
                }, { changeAddress: [], others: [] })
            let registeredData = this.deepCopy(filterData.changeAddress)
            const othersData = this.deepCopy(filterData.others)
            const orderId = [...new Set(registeredData.map(item => item.order_id))]
            if (orderId.join(',')) // 依工單查詢
                await this.getSearchData(orderId.join(','))
            if (this.packageCodeMap) {
                registeredData = registeredData.map(item => {
                    const packageCodeLen = this.packageCodeMap[item.order_id]
                        .filter(code => code === item.package_code)
                        .length
                    const { changes: { update_register_number: updateNum } } = item
                    // 同工單編號、遇到重複的歸戶碼需填寫新掛號單碼
                    if (packageCodeLen > 1 && !updateNum) item.hasUnfilled = true
                    return item
                })
            }
            this.dataPool = [...othersData, ...registeredData]
                .map(item => {
                    // 新狀態
                    item.status = this.statusNameMap[item.status]
                    return item
                })
                .sort((a, b) => {
                    if (a.create_time < b.create_time) return -1
                    if (a.create_time > b.create_time) return 1
                    return 0
                })
            this.totalRecords = this.dataPool.length
            if (this.dataPool.length > 0) this.setPagination()
            // 左上角未處理提示
            this.handleWarning()
        },
        getOperationsError(response) {
            var errMsg = this.$t('Error.Operation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
            this.$Loading.error()
        },
        getSearchData(orderId) {
            this.$Loading.start()
            this.packageCodeMap = null
            const config = {
                method: 'get',
                path: '/1/ins/c/data/get/',
                obj: this.getPostData(orderId),
                success: this.getSearchDataSuccess,
                error: this.getSearchDataError
            }
            return this.ajax(config)
        },
        getSearchDataSuccess(response) {
            this.$Loading.finish()
            if (!response.data || !response.data.data)
                return
            if (response.data.data.length === 0)
                return
            const data = response.data.data
            // NOTE: 1 掛號 2 雙掛號 3 快遞 4 退回
            this.packageCodeMap = data
                .filter(item => item.custom.posting_service === 1 || item.custom.posting_service === 2)
                .reduce((acc, crr) => {
                    // 依工單編號分類、列出歸戶碼
                    if (!acc[crr.order_id])
                        acc[crr.order_id] = []
                    acc[crr.order_id].push(crr.custom.package_code)
                    return acc
                }, {})
        },
        getSearchDataError(response) {
            var errMsg = this.$t('Error.Search.GetGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 缺少搜尋條件
                    errMsg += this.$t('Error.InsuranceSearch.Code1')
                    break
                case 2:
                    // 批次日期格式錯誤
                    errMsg += this.$t('Error.InsuranceSearch.Code2')
                    break
                case 3:
                    // 契約始期格式錯誤
                    errMsg += this.$t('Error.InsuranceSearch.Code3')
                    break
                case 4:
                    // 郵寄日期範圍需小於30天
                    errMsg += this.$t('Error.InsuranceSearch.Code4')
                    break
                case 5:
                    // 郵寄日期格式錯誤
                    errMsg += this.$t('Error.InsuranceSearch.Code5')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
            this.$Loading.error()
        },
        setInitData(data) {
            return data.map(item => {
                item.hasUnfilled = false
                item.original_status = this.statusNameMap[item.original_status]
                item.billing_category = this.billCateNameMap[item.custom.billing_category]
                if (item.custom.package_code)
                    item.package_code = item.custom.package_code
                if (item.custom.cycle_date)
                    item.cycle_date = item.custom.cycle_date.toString()
                return item
            })
        },
        getPostData(orderId) {
            const transData = {
                object_name: '',
                create_dates: '',
                given_date_type: 'multiple',
                type_code: '',
                status: '',
                cycle_type: '',
                order_id: orderId,
                custom: {
                    cycle_date: '',
                    billing_category: '',
                    posting_service: '',
                    unit_id: '',
                    channel: '',
                    mail_type: ''
                }
            }
            return transData
        },
        setPagination(limit) {
            if (limit)
                this.pageLimit = limit
            this.data = []
            if (this.$refs.pagination)
                this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setExtendColumn() {
            this.columns.forEach(element => {
                if (!element.ignore) {
                    const obj = {
                        title: element.title,
                        key: element.key
                    }
                    this.extendColumns.push(obj)
                }
            })
        },
        setGroup(bsData) {
            const obj = {}
            this.cycleDates.forEach(item => { obj[item] = [] })
            bsData.forEach(item => {
                if (obj[item.custom.cycle_date]) {
                    obj[item.custom.cycle_date]
                        .push(item.custom.package_code)
                }
            })
            return obj
        },
        resetData() {
            this.errorMsg = null
            this.data = []
            this.dataPool = []
        },
        resetRegisterNum() {
            this.registerNumber = null
        },
        cancelOrder(rowIndex) {
            const dataID = this.deepCopy(this.data[this.pageIndex][rowIndex].id)
            const config = {
                method: 'post',
                path: '/1/ins/c/operation/delete/',
                obj: { id: dataID },
                params: {
                    rowIndex: rowIndex,
                    dataID: dataID
                },
                success: this.cancelOrderSuccess,
                error: this.cancelOrderError
            }
            this.ajax(config)
        },
        cancelOrderSuccess(response, params) {
            this.data[this.pageIndex].splice(params.rowIndex, 1)
            this.dataPool = this.dataPool
                .filter(item => item.id !== params.dataID)
            this.totalRecords = this.dataPool.length
            if (this.dataPool.length === 0) this.errorMsg = this.$t('NoData')
            this.$Message.success(this.$t('Success'))
        },
        cancelOrderError(response) {
            var errMsg = this.$t('Error.Operation.DeleteGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        exportData() {
            const today = new Date()
            const year = today.getFullYear().toString().padStart(4, '0')
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const day = today.getDate().toString().padStart(2, '0')
            let data = this.deepCopy(this.dataPool)
            data.forEach((element, index) => {
                element.object_id += '\xa0'
                if (element.changes && element.changes.update_address)
                    element.remarks += `>${element.changes.update_address}`
                if (element.hasUnfilled) data.splice(index, 1)
            })
            // mixin from main.js
            data = this.excelExport(data)
            this.$refs.table.exportCsv({
                filename: 'OperationList_' + year + month + day + '.csv',
                columns: this.extendColumns,
                data: data
            })
            this.showConfirmModal = false
        },
        exportExcel() {
            if (this.hasUnfilled) this.showConfirmModal = true
            else this.exportData()
        },
        handleEdit(data) {
            this.selectedPolicy = null
            this.selectedPolicy = this.deepCopy(data)

            if (this.selectedPolicy.changes && this.selectedPolicy.changes.update_register_number) this.registerNumber = this.selectedPolicy.changes.update_register_number
            this.showModal = true
        },
        updateOperation() {
            const obj = { update_register_number: this.registerNumber.toString() }
            const postObj = {
                object_id: this.selectedPolicy.obj_id,
                changes: JSON.stringify(obj)
            }
            const config = {
                method: 'post',
                path: '/1/ins/c/operation/update/',
                obj: postObj,
                success: () => {
                    this.$Message.success(this.$t('Success'))
                    this.$emit('refresh', 'searchForm')
                },
                error: this.updateOperationError,
                final: () => {
                    this.getOperations()
                    this.showModal = false
                }
            }
            this.ajax(config)
        },
        updateOperationError(response) {
            var errMsg = this.$t('Error.Operation.UpdateGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 無效的值
                    errMsg += this.$t('Error.UpdateOperation.Code1')
                    break
                case 2:
                    // 保險單號不存在
                    errMsg += this.$t('Error.UpdateOperation.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleWarning() {
            const data = this.deepCopy(this.dataPool)
            this.hasUnfilled = data.some(item => item.hasUnfilled)
        },
        handleBtnVerify() {
            if (!isNaN(this.registerNumber) && this.registerNumber) return false
            else return true
        },
        rowClassName(row) {
            if (row.hasUnfilled) return 'row--warring'
        }
    },
    watch: {
        showModal(data) {
            if (!data) this.registerNumber = null
        }
    },
    beforeDestroy() {
        if (this.$Loading) this.$Loading.finish()
    }
}
</script>