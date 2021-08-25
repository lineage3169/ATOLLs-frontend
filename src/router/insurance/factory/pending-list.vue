<template>
    <div class="p-pending-list">
        <div class="content">
            <div v-if="errMsg" class="error-msg">{{errMsg}}</div>
            <Spin v-show="apiLoading" size="large" fix/>
            <div>
                <div v-show="dataPool.length > 0" class="info-bar mb-5">
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
                        ref="table"
                        max-height="600"
                        no-data-text="No data"
                        :columns="columns"
                        :data="data[pageIndex]"
                        :row-class-name="rowClassName">
                </Table>
                <div v-show="dataPool.length > 0" class="info-bar mt-5">
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
        </div>
    </div>
</template>
<script>
import Pagination from '@/components/pagination.vue'
import columns from './columns/pending-list'
export default {
    name: 'OperationList',
    components: { Pagination },
    data() {
        return {
            apiLoading: false,
            errMsg: '',
            columns: columns(this),
            statusNameMap: this.$store.state.statusNameMap,
            billCateNameMap: this.$store.state.billCateNameMap,
            data: [],
            dataPool: [],
            pageIndex: 0,
            pageLimit: 10,
            totalRecords: 0,
            timmer: null,
            outsourcing: ''
        }
    },
    created() {
        const { outsourcing = '' } = this.$store.state.profile || {}
        this.outsourcing = outsourcing
        if (!outsourcing)
            this.errMsg = this.$t('Error.NotGetOutsourcing')
        else this.getOperation()
    },
    methods: {
        getOperation() {
            this.resetData()
            this.apiLoading = true
            const path = '/1/ins/c/operation/get/'
            const config = {
                method: 'post',
                path: path,
                obj: { outsourcing_id: this.outsourcing },
                success: this.getOperationSuccess,
                error: this.getOperationError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getOperationSuccess(response) {
            if (!response) return
            if (response.data.data.length === 0) {
                this.errMsg = this.$t('NoData')
                return
            }

            this.dataPool = this.setData(response.data.data)
            this.totalRecords = this.dataPool.length
            this.setPagination()
            if (this.timmer === null)
                this.setIntervalToGet()
        },
        getOperationError(response) {
            var errMsg = this.$t('Error.Operation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setData(data) {
            return data.map(item => {
                item.status = this.statusNameMap[item.status]
                item.package_code = item.custom.package_code
                item.cycle_date = item.custom.cycle_date
                item.original_status = this.statusNameMap[item.original_status]
                item.billing_category = this.billCateNameMap[item.custom.billing_category]
                return item
            })
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            if (this.$refs.pagination)
                this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setIntervalToGet() {
            const sec = 1000
            this.timmer = setInterval(() => {
                this.getOperation()
            }, 60 * sec)
        },
        resetData() {
            this.data = []
            this.dataPool = []
            this.errMsg = ''
            this.pageIndex = 0
            this.pageLimit = 10
            this.totalRecords = 0
        },
        dateDisplay(str) {
            const s = str.toString()
            return `${s.slice(0, 4)}-${s.slice(4, 6)}-${s.slice(6)}`
        },
        rowClassName(row, index) {
            if (row.hasUnfilled) return 'row--warring'
        }
    },
    beforeDestroy() {
        clearInterval(this.timmer)
        this.timmer = null
    }
}
</script>