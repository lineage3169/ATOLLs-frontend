<template>
    <div class="m-search">
        <div class="content__collapse noselect">
            <Collapse v-model="searchCollapse" simple>
                <Panel name="1">
                    <span class="collapse__title noselect">
                        {{ $t('FilterB')}}
                    </span>
                    <div class="form-generate" slot="content">
                        <!-- 動態產出 from 元件 -->
                        <FormItems v-model="searchForm"
                                      :elements="condition"/>
                        <div class="form-generate__btns">
                            <div v-if="!searchForm.object_name && isCycleDateEmpty && enableSearch()"
                                 class="message--alert mt-18 mr-15">
                                {{$t('Only90DayDataSearch')}}
                            </div>
                            <Button :class="'btn btn--outline btn--long mr-15'"
                                    :disabled="!enableSearch()"
                                    @click.stop="resetInputData()">
                                    {{$t('Reset')}}
                            </Button>
                            <Tooltip :content="$t('Tooltips.Search')"
                                        :disabled="enableSearch()"
                                        max-width="350">
                                <Button type="primary"
                                        :class="'btn btn--long'"
                                        :loading="apiLoading"
                                        :disabled="!enableSearch()"
                                        @click.stop="handleDateConfirm()">
                                        {{ $t('Search') }}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
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
            <Button class="btn btn--export fz--large"
                    @click="setExportData()">
                    <Icon type="md-download" />
                    {{ $t('Export') }}
            </Button>
        </div>
        <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                stripe
                :columns="columns"
                :data="data[pageIndex]"
                class="table"
                max-height="600"
                ref="baseTable"
                no-data-text="No data">
        </Table>
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
                v-show="errorMsg && searchCollapse.length == 0">
            {{errorMsg}}
        </div>
        <LogModal  v-model="showLogModal"
                    :id="targetInsID"/>
        <!-- 日期區間警告 -->
        <Modal v-model="modalDisplay" width="360">
            <p slot="header" class="txt-center fz--large" style="color: #ffffff;">
                <Icon type="ios-information-circle"></Icon>
                <span>{{$t('SearchConfirm')}}</span>
            </p>
            <div class="txt-center fz--primary">
                <p>{{`${$t('PlaceHolder.SearchRange')} ${dateLimit} ${$t('Days')}`}}</p>
                <p>{{$t('PlaceHolder.SearchInfo')}}</p>
                <p>{{$t('PlaceHolder.SearchConfirm')}}</p>
            </div>
            <div slot="footer">
                <Button @click.stop="modalDisplay = false">
                        {{$t('Cancel')}}
                </Button>
                <Button type="primary"
                        :loading="apiLoading"
                        @click.stop="getData()">
                    {{$t('OK')}}
                </Button>
            </div>
        </Modal>
    </div>
</template>

<script>
import LogModal from '@/components/modal/search-log.vue'
import Pagination from '@/components/pagination.vue'
import FormItems from '@/components/form-items.vue'
import extend from './columns/base.extend'
import cloumns from './columns/base'
import condition from './condition/base'
const FileSaver = require('file-saver')
export default {
    name: 'SearchBase',
    components: {
        LogModal, Pagination, FormItems
    },
    data() {
        return {
            apiLoading: false,
            errorMsg: null,
            showLogModal: false,
            modalDisplay: false,
            searchCollapse: ['1'],
            searchForm: {
                object_name: '',
                cycle_date: [],
                billing_category: '',
                type_code: '',
                posting_service: '',
                unit_id: '',
                channel: '',
                status: '',
                cycle_type: '',
                effective_date: '',
                mail_date: [],
                order_id: '',
                outsourcing_id: '',
                isUpdatedAddress: false
            },
            targetInsID: '',
            condition: condition(this),
            columns: cloumns(this),
            extendColumns: extend(this),
            data: [],
            dataPool: [],
            dateLimit: 90,
            totalRecords: 0,
            visibleChannelName: {},
            keyNameMap: this.$store.state.keyNameMap,
            pageIndex: 0,
            pageLimit: 10,
            isCycleDateEmpty: true,
            ticket: '',
            outsourcingList: null
        }
    },
    created() {
        this.getOutsourcingInfo()
    },
    methods: {
        getData() {
            this.resetData()
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/ins/c/data/get/',
                obj: this.getPostData(),
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            this.dataPool = this.setData(response.data.data)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
            else this.errorMsg = this.$t('NoData')
            this.collectSearchBar()
        },
        getDataError(response) {
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
        },
        getAtollTicket() {
            const config = {
                method: 'post',
                path: '/1/sys/c/auth/ticket/get/',
                obj: { ATOLL_API_KEY: '1234' },
                success: response => { this.ticket = response.data.data },
                error: this.getAtollTicketError
            }
            return this.ajax(config)
        },
        getOutsourcingInfo() {
            const config = {
                method: 'get',
                path: '/1/ins/c/outsourcing/all/get/',
                success: this.getOutsourcingSuccess,
                error: this.getOutsourcingError
            }
            this.ajax(config)
        },
        getOutsourcingSuccess(response) {
            if (!response || !response.data)
                return this.setOutsourcingDisabled()
            if (!response.data.data || response.data.data.length === 0)
                return this.setOutsourcingDisabled()
            const data = response.data.data
            this.outsourcingList = data
                .reduce((acc, crr) => {
                    acc[crr.id] = `${crr.name} - ${crr.alias}`
                    return acc
                }, {})
            const index = this.condition
                .findIndex(item => item.model === 'outsourcing_id')
            if (index > -1)
                this.condition[index].optionMap = this.outsourcingList
        },
        setOutsourcingDisabled() {
            this.condition = this.condition
                .map((item) => {
                    if (item.model === 'outsourcing_id')
                        item.disabled = true
                    return item
                })
        },
        setData(inputData) {
            let data = this.deepCopy(inputData)
            const igonreArr = ['factory', 'id',
                'batchcode', 'create_date',
                'origin_id', 'group',
                'order_id', 'return_code',
                'meta', 'pdfDiasble',
                'custom', 'barcode',
                'create_time', 'vip'
            ]
            data = data.map(item => {
                // 設定PDF狀態
                item = this.setPdfBtnInit(item)
                // custom 濾掉沒有value的key
                item = this.filterCustomEmpty(item)
                // 將每筆資料中custom的key和value都移至父層
                item = this.setCutsomToParent(item)
                // 過濾掛號單碼只能在交寄後才能顯示
                item = this.filterRegisterNum(item)
                // 刪除 custom
                item = this.deleteCustom(item)
                // 所有value 嘗試用converValueByMaps轉換
                item = this.converObjValue(item)
                return item
            })
            // 將this.columns以外的Key 都塞入 custom
            // 並嘗試由 keyNameMap 轉換 key 值
            data = this.setCustom(data, this.columns, igonreArr)
            this.setExportColumns(data, igonreArr)
            return data
        },
        getPostData() {
            const flagArr = []
            if (this.searchForm.isUpdatedAddress)
                flagArr.push('recipient_address_update')
            const cycleDate = this.searchForm.cycle_date
            const createDates = this.getCreateDate(cycleDate) ? this.getCreateDate(cycleDate).join(',') : ''
            const transData = {
                create_dates: createDates,
                obj_name: this.searchForm.object_name,
                given_date_type: 'range',
                type_code: this.searchForm.type_code,
                status: this.searchForm.status,
                outsourcing_id: this.searchForm.outsourcing_id,
                order_id: this.searchForm.order_id,
                flags: flagArr.join(','),
                custom: {
                    cycle_date: this.getCycleDate(cycleDate),
                    billing_category: this.searchForm.billing_category,
                    posting_service: this.searchForm.posting_service,
                    unit_id: this.searchForm.unit_id,
                    channel: this.searchForm.channel,
                    cycle_type: this.searchForm.cycle_type,
                    effective_date: this.dateFormatTrans(this.searchForm.effective_date),
                    mail_date: this.searchForm.mail_date,
                    mail_type: this.searchForm.mail_type
                }
            }
            return transData
        },
        setCycleDate(date) {
            if (this.isEmptyArray(date)) this.searchForm.cycle_date = []
            else this.searchForm.cycle_date = date
        },
        setEffectiveDate(date) {
            this.searchForm.effective_date = this.convertStrToArr(date)
        },
        setMailDates(date) {
            this.searchForm.mail_date = this.convertStrToArr(date)
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setExportData() {
            const today = new Date()
            const year = today.getFullYear().toString().padStart(4, '0')
            const month = (today.getMonth() + 1).toString().padStart(2, '0')
            const day = today.getDate().toString().padStart(2, '0')
            let data = this.deepCopy(this.dataPool)

            data.forEach(element => {
                if (element.register_number) element.register_number += '\xa0'
                else element.register_number = ''
            })

            // mixin from main.js
            data = this.excelExport(data)

            this.$refs.baseTable.exportCsv({
                filename: 'BaseSearch_' + year + month + day + '.csv',
                columns: this.extendColumns,
                data: data
            })
        },
        handleDateConfirm() {
            const startDate = new Date(this.searchForm.cycle_date[0])
            const endDate = new Date(this.searchForm.cycle_date[1])
            const oneDaySec = 86400000
            const userDateRange = (endDate - startDate) / oneDaySec
            if (userDateRange > this.dateLimit) this.modalDisplay = true
            else this.getData()
        },
        handleLogSearch(rowIndex) {
            this.targetInsID = this.data[this.pageIndex][rowIndex].id
            this.showLogModal = true
        },
        handleDownload(rowIndex) {
            const id = this.data[this.pageIndex][rowIndex].id
            const postObj = { object_id: id }
            const config = {
                method: 'post',
                path: '/1/ins/c/others/image/download/',
                obj: postObj,
                type: 'blob',
                params: rowIndex,
                success: this.handleDownloadSuccess,
                error: this.handleDownloadError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        handleDownloadSuccess(response, rowIndex) {
            const filename = this.data[this.pageIndex][rowIndex].name || 'filename'
            const file = new Blob([response.data], { type: 'application/pdf' })
            FileSaver.saveAs(file, filename + '.pdf')
        },
        setExportColumns(expandData, igonreArr) {
            const extendKey = [...this.extendColumns
                .map(items => items.key)
                .filter(item => item), ...igonreArr]
            // 檢查並自動添加[匯出列表]沒有的欄位
            expandData.forEach(element => {
                const extend = Object.keys(element)
                    .filter(key => extendKey.indexOf(key) === -1)
                const hasNotInExtend = extend.length > 0
                if (hasNotInExtend) {
                    extend.forEach(keys => {
                        let objTitle = keys
                        if (Object.keys(this.keyNameMap).indexOf(keys) >= 0)
                            objTitle = this.keyNameMap[keys]
                        extendKey.push(keys)
                        const obj = {
                            title: objTitle,
                            key: keys
                        }
                        this.extendColumns.push(obj)
                    })
                }
            })
        },
        enableSearch() {
            let verify = false
            // 批次日期 (日期超過天數提醒) or 其他條件則一即可
            const verifyValue = key => {
                if (this.searchForm[key]) verify = true
            }
            const verifyItems = ['billing_category', 'channel',
                'effective_date', 'object_name', 'posting_service',
                'status', 'type_code', 'unit_id',
                'mail_type', 'cycle_type', 'order_id',
                'outsourcing_id', 'isUpdatedAddress']
            verifyItems.forEach(item => { verifyValue(item) })
            if (this.searchForm.mail_date.length > 0 && this.searchForm.mail_date.length < 31)
                verify = true
            if (this.searchForm.cycle_date.length === 2) {
                this.isCycleDateEmpty = false
                verify = true
            }
            else this.isCycleDateEmpty = true

            return verify
        },
        resetData() {
            this.data = []
            this.dataPool = []
            this.totalRecords = 0
            this.errorMsg = null
            this.modalDisplay = false
        },
        resetInputData() {
            this.searchForm = {
                object_id: '',
                cycle_date: [],
                billing_category: '',
                type_code: '',
                posting_service: '',
                unit_id: '',
                channel: '',
                status: '',
                cycle_type: '',
                effective_date: '',
                mail_date: [],
                order_id: '',
                outsourcing_id: '',
                isUpdatedAddress: false
            }
            this.resetDataMsg()
        },
        collectSearchBar() {
            const collapse = setTimeout(() => {
                this.searchCollapse = []
                clearTimeout(collapse)
            }, 200)
        }
    },
    watch: {
        searchForm: {
            deep: true,
            handler() {
                this.enableSearch()
                const dateLimit = 30
                if (this.searchForm.mail_date.length > dateLimit) {
                    this.$Modal.warning({
                        title: this.$t('WARNING'),
                        content: this.$t('Error.MultiDateLimit'),
                        okText: this.$t('OK')
                    })
                }
            }
        }
    }
}
</script>