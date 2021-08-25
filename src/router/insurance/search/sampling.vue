<template>
    <div class="orderSearchApp">
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
                            <Button :class="'btn btn--outline btn--long mr-15'"
                                    :disabled="disableSearch()"
                                    @click.stop="resetInputs()">
                                    {{$t('Reset')}}
                            </Button>
                            <Button type="primary"
                                    :class="'btn btn--long'"
                                    :loading="apiLoading"
                                    :disabled="disableSearch()"
                                    @click.stop="getData()">
                                    {{ $t('Search') }}
                            </Button>
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
        <div class="info-bar" v-show="dataPool.length > 0">
            <Pagination v-model="pageIndex"
                        ref="pagination"
                        :data-length="data.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                stripe
                class="table"
                max-height="600"
                ref="baseTable"
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
        <div v-show="errorMsg && searchCollapse.length == 0"
            class="error-msg">
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
import condition from './condition/sampling'
import columns from './columns/sampling'
const FileSaver = require('file-saver')
export default {
    name: 'Sampling',
    components: {
        ConfirmModal, Pagination, FormItems
    },
    data() {
        return {
            searchForm: {
                file: null,
                orderID: '',
                objectName: ''
            },
            data: [],
            dataPool: [],
            operationsData: [],
            pageIndex: 0,
            pageLimit: 10,
            totalRecords: 0,
            searchCollapse: ['1'],
            errorMsg: '',
            apiLoading: false,
            columns: columns(this),
            condition: condition(this),
            title: '',
            confirmInfo: {},
            confirmModal: false
        }
    },
    created() {
        this.getOperations()
    },
    methods: {
        getData() {
            this.apiLoading = true
            this.resetData()
            const file = this.searchForm.file
            const orderId = this.searchForm.orderID
            const objectName = this.searchForm.objectName
            const fromData = new FormData()
            fromData.append('file', file)
            fromData.append('order_id', orderId)
            fromData.append('object_name', objectName)
            const config = {
                method: 'post',
                path: '/1/ins/c/data/sample/get/',
                fromData: fromData,
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
                    errMsg += this.$t('Error.Sample.Code1')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
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
            const arr = response.data.data || []
            this.operationsData = arr.map(item => {
                if (item.barcode) return item.barcode
            })
        },
        getOperationsError(response) {
            var errMsg = this.$t('Error.Operation.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setData(inputData) {
            let data = this.deepCopy(inputData)
            const igonreArr = ['factory', 'id',
                'batchcode', 'create_date',
                'origin_id', 'group',
                'order_id', 'return_code',
                'meta', 'pdfDiasble',
                'custom', 'barcode',
                'create_time', 'isInQueue'
            ]
            data = data.map(item => {
                if (this.operationsData.indexOf(item.barcode) > -1)
                    item.isInQueue = true
                else item.isInQueue = false
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
            return data
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        disableSearch() {
            const file = this.searchForm.file
            const orderID = this.searchForm.orderID
            const objectName = this.searchForm.objectName
            if (file || orderID || objectName) return false
            return true
        },
        resetInputs() {
            this.searchForm.file = null
            this.searchForm.orderID = ''
            this.searchForm.objectName = ''
            this.resetDataMsg()
        },
        collectSearchBar() {
            const collapse = setTimeout(() => {
                this.searchCollapse = []
                clearTimeout(collapse)
            }, 200)
        },
        handleOperation(index, title) {
            this.title = title
            if (this.confirmInfo)
                this.confirmInfo = {}
            const t = setTimeout(() => {
                this.confirmInfo = this.data[this.pageIndex][index]
                this.confirmModal = true
                clearTimeout(t)
            }, 200)
        },
        async refreshData() {
            await this.getOperations()
            this.getData()
        },
        resetData() {
            this.data = []
            this.dataPool = []
            this.totalRecords = 0
            this.errorMsg = ''
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
        }
    }
}
</script>