<template>
    <div class="m-search">
        <div class="content__collapse noselect">
            <Collapse v-model="searchCollapse" simple>
                <Panel name="1">
                    <span class="collapse__title">
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
                            <Tooltip max-width="350"
                                     :content="$t('Tooltips.Search')"
                                     :disabled="enableSearch()">
                                <Button type="primary"
                                        :class="'btn btn--long'"
                                        :loading="apiLoading"
                                        :disabled="!enableSearch()"
                                        @click.stop="getData()">
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
            <div class="btn btn--export fz--large"></div>
        </div>
        <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                stripe
                class="table"
                max-height="600"
                no-data-text="No data"
                :columns="columns"
                :data="data[pageIndex]">
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
        <ConfirmModal v-model="confirmModal"
                      :confirm-info="confirmInfo"
                      :title="title"
                      @refresh="refreshData" />
    </div>
</template>

<script>
import ConfirmModal from '@/components/modal/confirm/operation.vue'
import Pagination from '@/components/pagination.vue'
import FormItems from '@/components/form-items.vue'
import cloumns from './columns/operation'
import condition from './condition/operation'
const FileSaver = require('file-saver')
export default {
    name: 'SearchOperation',
    components: { ConfirmModal, Pagination, FormItems },
    data() {
        return {
            apiLoading: false,
            title: '',
            confirmInfo: {},
            confirmModal: false,
            errorMsg: null,
            searchCollapse: ['1'],
            searchForm: {
                object_name: '',
                cycle_date: [],
                type_code: '',
                unit_id: '',
                channel: '',
                status: '',
                cycle_type: '',
                posting_service: '',
                cycle_date_type: 'multiple',
                billing_category: ''
            },
            columns: cloumns(this),
            condition: condition(this),
            data: [],
            excelFields: {},
            totalRecords: 0,
            statusNameMap: this.$store.state.statusNameMap,
            billCateNameMap: this.$store.state.billCateNameMap,
            cycleTypeNameMap: this.$store.state.cycleTypeNameMap,
            channelNameMap: this.$store.state.channelNameMap,
            mailTypeNameMap: this.$store.state.mailTypeNameMap,
            visibleChannelName: {},
            dataPool: [],
            operationsData: [],
            pageIndex: 0,
            pageLimit: 10,
            isCycleDateEmpty: true
        }
    },
    created() {
        this.getOperations()
    },
    methods: {
        getOperations() {
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/ins/c/operation/get/',
                success: this.getOperationsSuccess,
                error: this.getOperationsError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        getOperationsSuccess(response) {
            if (response.data.data && response.data.data.length > 0) {
                response.data.data.forEach(element => {
                    if (element.barcode) this.operationsData.push(element.barcode)
                })
            }
        },
        getOperationsError(response) {
            var errMsg = this.$t('Error.Operation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
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
            this.dataPool = this.setData(response)
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
        setData(inputData) {
            function toParent(item, key) {
                item[key] = item.custom[key] ? item.custom[key] : ''
            }
            let data = []
            if (inputData.data && inputData.data.data) {
                data = inputData.data.data
                    .filter(items => {
                        return items.progress !== 'PO' && items.status !== 'R'
                    })
            }
            if (data.length > 0) {
                data = data.map(item => {
                    const keys = ['cycle_date', 'cycle_type', 'mail_type',
                        'channel', 'unit_id', 'billing_category']
                    keys.forEach(key => { toParent(item, key) })
                    item.isInQueue = false
                    return item
                })
                if (this.operationsData.length > 0) {
                    data = data.map(item => {
                        if (this.operationsData.indexOf(item.barcode) > -1)
                            item.isInQueue = true
                        return item
                    })
                }
            }
            return data
        },
        getPostData() {
            const cycleDate = this.searchForm.cycle_date
            const createDates = this.getMulitCreateDate(cycleDate) ? this.getMulitCreateDate(cycleDate).join(',') : ''
            const transData = {
                create_dates: createDates,
                obj_name: this.searchForm.object_name,
                given_date_type: this.searchForm.cycle_date_type,
                type_code: this.searchForm.type_code,
                status: this.searchForm.status,
                custom: {
                    billing_category: this.searchForm.billing_category,
                    cycle_date: this.dateFormatTrans(cycleDate),
                    posting_service: this.searchForm.posting_service,
                    unit_id: this.searchForm.unit_id,
                    channel: this.searchForm.channel,
                    cycle_type: this.searchForm.cycle_type,
                    mail_type: this.searchForm.mail_type
                }
            }
            return transData
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            if (this.$refs.pagination)
                this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setCycleDate(date) {
            this.searchForm.cycle_date = this.convertStrToArr(date)
        },
        handleOperation(index, target) {
            this.title = target
            if (this.confirmInfo) this.confirmInfo = {}
            const t = setTimeout(() => {
                this.confirmInfo = this.data[this.pageIndex][index]
                this.confirmModal = true
                clearTimeout(t)
            }, 200)
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
        enableSearch() {
            let verify = false
            // 批次日期 (日期超過天數提醒) or 其他條件則一即可
            const verifyValue = key => {
                if (this.searchForm[key]) verify = true
            }
            const verifyItems = ['billing_category', 'channel',
                'object_name', 'status',
                'unit_id', 'cycle_type',
                'type_code', 'mail_type']
            verifyItems.forEach(item => verifyValue(item))
            if (this.searchForm.cycle_date.length > 0 && this.searchForm.cycle_date.length < 31) {
                this.isCycleDateEmpty = false
                verify = true
            }
            else this.isCycleDateEmpty = true
            return verify
        },
        resetData() {
            this.data = []
            this.dataPool = []
            this.errorMsg = null
        },
        resetInputData() {
            this.searchForm = {
                object_id: '',
                cycle_date: [],
                cycle_date_type: 'multiple',
                billing_category: '',
                type_code: '',
                posting_service: '',
                unit_id: '',
                channel: '',
                status: '',
                cycle_type: '',
                mail_type: ''
            }
            this.resetDataMsg()
        },
        async refreshData() {
            await this.getOperations()
            this.getData()
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
                if (this.searchForm.cycle_date.length > dateLimit) {
                    this.$Modal.warning({
                        title: this.$t('WARNING'),
                        content: this.$t('Error.MultiDateLimit'),
                        okText: this.$t('OK')
                    })
                }
            }
        },
        apiLoading(data) {
            if (data) this.searchCollapse = ['1']
        }
    }
}
</script>