<template>
    <div class="p-maintenance mt-15">
        <div v-show="dataPool.length > 0"
            class="txt-color--error mb-5">
            {{ $t('MaintainAlert')}}
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
            <Button class="btn btn--export fz--large"
                    @click="setExportData()">
                    <Icon type="md-download" />
                    {{ $t('Export') }}
            </Button>
        </div>
        <Table  stripe
                class="table"
                max-height="600"
                ref="table"
                :no-data-text="$t('NoData')"
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
        <Detail v-model="detailShow" :vehicle="vehicle"/>
        <Check v-model="checkShow"
            :vehicle="vehicle"
            @on-save="getData"/>
        <Maintain v-model="maintainShow"
            :vehicle="vehicle"
            :type="maintainType"
            @on-save="getData"/>
    </div>
</template>

<script>
import Pagination from '@/components/pagination.vue'
import columns from './columns/maintenance'
import Detail from '@/components/modal/maintain/detail.vue'
import Check from '@/components/modal/maintain/check.vue'
import Maintain from '@/components/modal/maintain/maintain.vue'
export default {
    name: 'VehicleMaintenance',
    components: { Pagination, Detail, Check, Maintain },
    data() {
        return {
            data: [],
            dataPool: [],
            vehicle: null,
            maintainType: '',
            columns: columns(this),
            totalRecords: 0,
            pageIndex: 0,
            pageLimit: 10,
            detailShow: false,
            checkShow: false,
            maintainShow: false
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            const config = {
                method: 'get',
                path: '/1/pm/c/search/maintain/get/',
                success: this.getDataSuccess,
                error: this.getDataError
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            this.dataPool = this.setData(data)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
        },
        getDataError(response) {
            let errMsg = this.$t('Error.MaintainUpdate.General')
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        setData(data) {
            /*
                vehicle_maintain 車輛維護
                blake_fluid 剎車油
                engine_oil 機油
                exhaust_fluid 尿素
            */
            const result = data
                .map(item => {
                    const maintain = item?.custom?.v_maintain ? item.custom.v_maintain : {}
                    const create_time = item?.create_time ? item.create_time : ''
                    const arrival_date = item?.custom?.arrival_date ? item.custom.arrival_date : ''
                    let check = false
                    if (item?.custom?.check?.status) check = true
                    // const vehicle_maintain = maintain?.vehicle_maintain ? maintain.vehicle_maintain : ''
                    item.vehicle_maintain = this.getMatainDate(maintain.vehicle_maintain, create_time)
                    item.blake_fluid = this.getMatainDate(maintain.blake_fluid, arrival_date)
                    item.engine_oil = this.getMatainDate(maintain.engine_oil, arrival_date)
                    item.exhaust_fluid = this.getMatainDate(maintain.exhaust_fluid, arrival_date)
                    // 保養提醒
                    item.vehicle_maintain_alert = this.getAlert(item.vehicle_maintain, 30)
                    item.blake_fluid_alert = this.getAlert(item.blake_fluid, 180)
                    item.engine_oil_alert = this.getAlert(item.engine_oil, 720)
                    item.exhaust_fluid_alert = this.getAlert(item.exhaust_fluid, 720)
                    // 檢查中
                    item.check = check
                    return item
                })
                .filter(item => item.progress !== 'LG')
            return result
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setExportData() {
            const maintenance = this.$t('MaintenanceA')
            const data = this.dataPool
                .map(item => {
                    item.check = item.check ? 'Y' : ''
                    if (item.vehicle_maintain_alert)
                        item.vehicle_maintain += `(${maintenance})`
                    if (item.blake_fluid_alert)
                        item.blake_fluid += `(${maintenance})`
                    if (item.engine_oil_alert)
                        item.engine_oil += `(${maintenance})`
                    if (item.exhaust_fluid_alert)
                        item.exhaust_fluid += `(${maintenance})`
                    return item
                })
            const columns = this.columns
                .filter(item => item.key !== 'action' && !item.type)
            this.$refs.table.exportCsv({
                filename: '查詢結果.csv',
                columns: columns,
                data: data
            })
        },
        handleModal(id, type, parmas = '') {
            const [data] = this.dataPool
                .filter(item => item.id === id)
            this.vehicle = data
            switch (type) {
            case 'DETAIL':
                this.detailShow = true
                break
            case 'CHECK':
                this.checkShow = true
                break
            case 'MAINTAIN':
                this.maintainShow = true
                this.maintainType = parmas
                break
            default:
                break
            }
        }
    }
}
</script>