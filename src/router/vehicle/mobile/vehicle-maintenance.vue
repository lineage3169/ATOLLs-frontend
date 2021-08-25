<template>
    <div class="view">
        <!-- 車輛保養 -->
        <Header :title="`${$t('Vehicle')}${$t('MaintenanceA')}`"/>
        <Form v-show="view === 'LIST'"
            label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- 生產編號 -->
            <FormItem class="mb-10"
                :label="$t('Produce') + $t('ID')" >
                <Input v-model="form.produceId"
                    clearable
                    :placeholder="$t('PlaceHolder.OperationsIdLastFive')" />
            </FormItem>
        </Form>
        <!-- 訊息 -->
        <div v-if="msg" class="error-msg">
            {{ msg }}
        </div>
        <!-- 列表 -->
        <div v-if="list.length > 0 && view === 'LIST'" class="id-list">
            <div v-for="(item, index) in list"
                class="id-list__item"
                :key="index"
                @click="produceId = item.origin_id; getData()">
                {{ item.origin_id.slice(0, -5) }}
                <span style="font-size: 20px; font-weight: bold;">
                    {{ item.origin_id.slice(-5) }}
                </span>
            </div>
        </div>
        <!-- 查詢結果 -->
        <div v-if="resultData.length > 0 && view === 'RESULT'"
            class="info-result mt-20">
            <div v-for="(item, index) in resultData"
                class="info-result__item mb-20"
                :key="index" >
                <div class="info-result__item__label">
                    {{ item.label }}
                </div>
                <div class="info-result__item__content">
                    {{ item.content }}
                </div>
            </div>
        </div>
        <!-- 保養 -->
        <div v-for="(item, index) in maintain"
            class="maintain-btn mb-15"
            :class="{ 'maintain-btn--error' : item.status}"
            :key="index"
            @click="handleClick(item)">
            <div class="maintain-btn__label">
                {{ item.label }}
            </div>
            <div class="maintain-btn__info">
                {{ `${item.days} ${$t('Days')}` }}
            </div>
        </div>
        <div class="footer">
            <Button v-show="view === 'RESULT'"
                class="btn btn--outline w-100"
                @click.stop="back()">
                {{ $t('Back') }}
            </Button>
            <Button v-show="view === 'LIST'"
                class="btn w-100"
                :loading="apiLoading"
                :disabled="!form.produceId || form.produceId.length !== 5"
                @click.stop="getList()">
                {{ $t('Search') }}
            </Button>
        </div>
        <Maintain v-model="maintainShow"
            :vehicle="vehicle"
            :type="maintainType"
            @on-save="getData"/>
    </div>
</template>
<script>
import Maintain from '@/components/modal/maintain/maintain.vue'
export default {
    name: 'VehicleMaintenance',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Maintain
    },
    data() {
        return {
            form: {
                produceId: ''
            },
            msg: '',
            view: 'LIST',
            vehicle: null,
            list: [],
            resultData: [],
            maintain: [],
            maintainType: '',
            maintainShow: false,
            apiLoading: false
        }
    },
    methods: {
        getList() {
            this.resetData()
            this.apiLoading = true
            const config = {
                method: 'get',
                obj: { object_id: this.form.produceId },
                path: '/1/pm/c/v/list/get',
                success: this.getListSuccess,
                error: this.getVehicleListError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getListSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            if (data.length > 0) this.list = this.deepCopy(data)
            else this.msg = this.$t('NoData')
        },
        getData() {
            this.apiLoading = true
            if (!this.produceId) return
            const config = {
                method: 'get',
                obj: { search_id: this.produceId },
                path: '/1/pm/c/search/general/get/',
                success: this.getDataSuccess,
                error: this.pmSearchError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const [data] = response.data.data
            const result = [
                // 生產編號
                {
                    label: `${this.$t('Produce')}${this.$t('ID')}`,
                    content: data?.origin_id
                },
                // 底盤編號
                {
                    label: `${this.$t('Chassis')}${this.$t('ID')}`,
                    content: data?.name
                }
            ]
            this.resultData = result.map(item => {
                item.content = item.content ? item.content : '-'
                return item
            })
            const create_time = data?.create_time ? data.create_time : ''
            const arrival_date = data?.custom?.arrival_date ? data.custom.arrival_date : ''
            const v_maintain = data?.custom?.v_maintain
                ? data?.custom?.v_maintain
                : {}
            const vehicle_maintain =
                this.getMatainDate(v_maintain?.vehicle_maintain, create_time)
            const blake_fluid =
                this.getMatainDate(v_maintain?.blake_fluid, arrival_date)
            const engine_oil =
                this.getMatainDate(v_maintain?.engine_oil, arrival_date)
            const exhaust_fluid =
                this.getMatainDate(v_maintain?.exhaust_fluid, arrival_date)
            this.maintain = [
                {
                    // 車輛維護
                    keys: 'vehicle_maintain',
                    label: `${this.$t('Vehicle')}${this.$t('Maintenance')}`,
                    days: vehicle_maintain,
                    type: 'VM',
                    status: this.getAlert(vehicle_maintain, 30)
                },
                {
                    // 剎車油
                    keys: 'blake_fluid',
                    label: this.$t('BlakeFluid'),
                    days: blake_fluid,
                    type: 'BF',
                    status: this.getAlert(blake_fluid, 180)
                },
                {
                    // 機油
                    keys: 'engine_oil',
                    label: this.$t('EngineOil'),
                    days: engine_oil,
                    type: 'EO',
                    status: this.getAlert(engine_oil, 720)
                },
                {
                    // 尿素
                    keys: 'exhaust_fluid',
                    label: this.$t('ExhaustFluid'),
                    days: exhaust_fluid,
                    type: 'EF',
                    status: this.getAlert(exhaust_fluid, 720)
                }
            ]
            this.vehicle = data
            this.view = 'RESULT'
        },
        handleClick(item) {
            if (!item.status) return
            this.maintainType = item.type
            this.maintainShow = true
        },
        back() {
            this.view = 'LIST'
            this.maintain = []
        },
        resetData() {
            this.list = []
            this.msg = ''
        }
    }
}
</script>