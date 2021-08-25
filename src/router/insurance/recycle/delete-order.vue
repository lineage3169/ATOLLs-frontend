<template>
    <div class="p-delete-order">
        <ButtonGroup class="mt-10">
            <Button class="h-40 w-150"
                    :type="listActive"
                    @click.stop="recyleMode = false">
                <Icon type="ios-list-box"
                    size="22"
                    :class="{'icon--unselected':recyleMode}"/>
            </Button>
            <Button class="h-40 w-150"
                    :type="recyleActive"
                    :disabled="recyleCount === 0"
                    @click.stop="recyleMode = true">
                <Badge dot :count="recyleCount" :offset="[2,2]">
                    <Icon type="md-trash"
                        size="22"
                        :class="{'icon--unselected':!recyleMode}"/>
                </Badge>
            </Button>
        </ButtonGroup>
        <div v-if="!recyleMode" class="tool-bar">
            <div class="search-bar">
                <div class="input w-300">
                    <div class="input__content">
                        <Input v-model="inputOrderID"
                                size="large"
                                clearable
                                :placeholder="`${$t('PlaceHolder.PleaseTypeOrderID')}...`"/>
                    </div>
                </div>
                <Button class="btn w-150 fz--primary ml-10"
                        :loading="apiLoading"
                        :disabled="!inputOrderID"
                        @click.stop="getData()">
                    {{ $t('Search') }}
                </Button>
            </div>
            <div class="action">
                <Button v-if="dataPool && dataPool.length"
                    class="btn btn--error w-150 fz--primary"
                    @click.stop="deleteModalShow = true">
                    {{ $t('Delete') + $t('Order') }}
                </Button>
            </div>
        </div>
        <div v-show="!recyleMode" class="table mt-30">
            <div v-show="dataPool.length > 0" class="page-bar d-flex mb-15">
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
                    :no-data-text="$t('NoData')"
                    :columns="columns"
                    :data="data[pageIndex]">
            </Table>
            <div v-show="dataPool.length > 0" class="page-bar d-flex mt-15">
                <Pagination v-model="pageIndex"
                            :data-length="data.length"
                            :data-pool-length="dataPool.length"
                            :limit="pageLimit"
                            @reflash-limit="setPagination"/>
                <div class="info-bar__total-records">
                    {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
                </div>
            </div>
        </div>
        <div v-show="recyleMode" class="recycle-container">
            <div v-for="(item, index) in restoreList"
                class="recycle-items"
                :key="index"
                @click.stop="restoreConfirm(item)">
                <div class="recycle-items__title">
                    {{item}}
                </div>
                <div class="recycle-items__icon">
                    <Icon type="ios-undo" />
                </div>
            </div>
        </div>
        <Modal v-model="msgModalShow"
            footer-hide
            class-name="vertical-center-modal"
            :width="300"
            :closable="false"
            :mask-closable="false">
            <div class="d-flex h-150 align-center justify-center fz--large">
                <div class="model-content__icon mr-15">
                    <div v-if="msgModalType === 'LOADING'"
                        class="loader ps-static">
                    </div>
                    <div v-if="msgModalType === 'SUCCESS'"
                        class="fz--huge txt-color--success">
                        <Icon type="ios-checkmark-circle" />
                    </div>
                    <div v-if="msgModalType === 'ERROR'"
                        class="fz--huge txt-color--error">
                        <Icon type="md-close-circle" />
                    </div>
                </div>
                <div v-html="modalMsg"
                    class="model-content__content first-letter">
                </div>
            </div>
        </Modal>
        <DeleteConfirm v-model="deleteModalShow"
            :msg="orderID"
            :loading="deleteLoading"
            :on-ok="saveOrder"/>
    </div>
</template>
<script>
import Pagination from '@/components/pagination.vue'
import columns from './columns/delete-order'
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'DeleteOrder',
    components: { Pagination, DeleteConfirm },
    data() {
        return {
            recyleMode: false,
            recyleCount: 0,
            inputOrderID: '',
            orderID: '',
            modalMsg: '',
            data: [],
            dataPool: [],
            restoreList: [],
            columns: columns(this),
            pageIndex: 0,
            pageLimit: 10,
            totalRecords: 0,
            errorMsg: '',
            msgModalType: 'LOADING',
            msgModalShow: false,
            deleteModalShow: false,
            apiLoading: false,
            deleteLoading: false
        }
    },
    created() {
        this.getRestoreList()
    },
    methods: {
        getData() {
            this.apiLoading = true
            const postObj = { order_id: this.inputOrderID }
            const msg = `${this.$t('Search')}${this.$t('Failed')}`
            const config = {
                method: 'get',
                obj: postObj,
                path: '/1/ins/c/data/order/get/',
                success: this.getDataSuccess,
                error: err => {
                    this.modalMsg = `${msg}!<br>`
                    this.handleActionError(err)
                },
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            this.data = []
            this.dataPool = []
            this.orderID = this.inputOrderID
            if (response.data && response.data.data) this.dataPool = this.setData(response.data.data)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
            else this.errorMsg = this.$t('NoData')
        },
        getRestoreList() {
            const config = {
                method: 'get',
                path: '/1/ins/c/data/order/restore/list/get/',
                success: this.getRestoreListSuccess,
                error: this.getRestoreListError
            }
            this.ajax(config)
        },
        getRestoreListSuccess(response) {
            if (response.data && response.data.data) this.restoreList = response.data.data
            this.recyleCount = this.restoreList.length
            if (this.recyleCount === 0) this.recyleMode = false
        },
        getRestoreListError(response) {
            let errMsg = `${this.$t('Error.RestoreList.General')}<br>`
            if (response.status) errMsg += this.unexpectedErrMsg(response)
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
                'create_time', 'Flag', 'factory_id'
            ]
            data = data.map(item => {
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
        saveOrder() {
            const msg = `${this.$t('DeletingOrder')}`
            const msgFail = `${this.$t('Order')}${this.$t('Delete')}${this.$t('Failed')}`
            this.msgModalType = 'LOADING'
            this.modalMsg = `${msg}...`
            this.msgModalShow = true
            this.deleteLoading = true
            const postObj = { order_id: this.orderID }
            const config = {
                method: 'post',
                path: '/1/ins/c/data/order/save/',
                obj: postObj,
                success: this.saveOrderSuccess,
                error: err => {
                    this.modalMsg = `${msgFail}!<br>`
                    this.handleActionError(err)
                },
                final: () => { this.deleteLoading = false }
            }
            this.ajax(config)
        },
        saveOrderSuccess() {
            this.deleteOrder()
        },
        handleActionError(response) {
            let errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供工單編號
                    errMsg += this.$t('Error.SaveOrder.Code1')
                    break
                case 2:
                    // 該工單編號不存在
                    errMsg += this.$t('Error.SaveOrder.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.msgModalType = 'ERROR'
            this.modalMsg += errMsg
            this.msgModalShow = true
            const t = setTimeout(() => {
                this.msgModalShow = false
                clearTimeout(t)
            }, 1500)
        },
        deleteOrder() {
            this.deleteLoading = true
            const postObj = { order_id: this.orderID }
            const msg = `${this.$t('Order')}${this.$t('Delete')}${this.$t('Failed')}`
            const config = {
                method: 'post',
                path: '/1/ins/c/data/order/delete/',
                obj: postObj,
                success: this.deleteOrderSuccess,
                error: err => {
                    this.modalMsg = `${msg}!<br>`
                    this.handleActionError(err)
                },
                final: () => { this.deleteLoading = false }
            }
            this.ajax(config)
        },
        deleteOrderSuccess() {
            const msg = `${this.$t('Order')}${this.$t('Delete')}${this.$t('Success')}`
            this.getRestoreList()
            this.msgModalType = 'SUCCESS'
            this.modalMsg = `${msg}!`
            const t = setTimeout(() => {
                this.msgModalShow = false
                clearTimeout(t)
            }, 1500)
            this.deleteModalShow = false
            this.dataPool = []
            this.data = []
        },
        restoreConfirm(orderID) {
            const content = `${this.$t('Restore')} ${orderID} ?`
            this.$Modal.confirm({
                title: this.$t('Prompt'),
                content: content,
                okText: this.$t('OK'),
                cancelText: this.$t('Cancel'),
                onOk: () => { this.restoreOrder(orderID) }
            })
        },
        restoreOrder(orderID) {
            const postObj = { order_id: orderID }
            const msg = `${this.$t('RestoringOrder')}`
            this.msgModalType = 'LOADING'
            this.modalMsg = `${msg}...`
            this.msgModalShow = true
            const config = {
                method: 'post',
                path: '/1/ins/c/data/order/restore/',
                obj: postObj,
                params: orderID,
                success: this.restoreOrderSuccess,
                error: this.restoreOrderError,
                final: () => { this.msgModalShow = false }
            }
            this.ajax(config)
        },
        restoreOrderSuccess(response, orderID) {
            this.$Message.success(this.$t('Restore') + this.$t('Success'))
            this.restoreList = this.restoreList
                .filter(item => item !== orderID)
            if (this.restoreList.length === 0) this.getRestoreList()
        },
        restoreOrderError(response) {
            let errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供工單編號
                    errMsg += this.$t('Error.RestoreOrder.Code1')
                    break
                case 2:
                    // 找不到回復檔
                    errMsg += this.$t('Error.RestoreOrder.Code2')
                    break
                case 3:
                    // 該工單編號已存在資料庫
                    errMsg += this.$t('Error.RestoreOrder.Code3')
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
        }
    },
    computed: {
        listActive() {
            if (!this.recyleMode) return 'primary'
            return 'default'
        },
        recyleActive() {
            if (this.recyleMode) return 'primary'
            return 'default'
        }
    }
}
</script>