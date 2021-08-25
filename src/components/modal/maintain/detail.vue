<template>
    <Modal v-model="show"
        class="maintain-detail-modal"
        :width="1024">
        <div slot="header" class="fz--large">
            {{ $t('Details') }}
        </div>
        <div class="info mb-10">
            <div v-for="(item, index) in info"
                class="info__item"
                :key="index">
                <div class="info__item__label">
                    {{ item.label }}
                </div>
                <div class="info__item__content">
                    {{ item.value }}
                </div>
            </div>
        </div>
        <div class="maintain">
            <!-- 車輛維護 -->
            <div class="maintain-table">
                <div class="maintain-table__header">
                    {{ `${$t('Vehicle')}${$t('Maintenance')}` }}
                </div>
                <div v-for="(item, index) in vehicleMaintain"
                    class="maintain-table__row"
                    :class="{'row--secondary': index % 2}"
                    :key="index">
                    {{ dateToFormat(item) }}
                </div>
            </div>
            <!-- 剎車油 -->
            <div class="maintain-table">
                <div class="maintain-table__header">
                    {{ $t('BlakeFluid') }}
                </div>
                <div v-for="(item, index) in blakeFluid"
                    class="maintain-table__row"
                    :class="{'row--secondary': index % 2}"
                    :key="index">
                    {{ dateToFormat(item) }}
                </div>
            </div>
            <!-- 機油 -->
            <div class="maintain-table">
                <div class="maintain-table__header">
                    {{ $t('EngineOil') }}
                </div>
                <div v-for="(item, index) in engineOil"
                    class="maintain-table__row"
                    :class="{'row--secondary': index % 2}"
                    :key="index">
                    {{ dateToFormat(item) }}
                </div>
            </div>
            <!-- 尿素 -->
            <div class="maintain-table">
                <div class="maintain-table__header">
                    {{ $t('ExhaustFluid') }}
                </div>
                <div v-for="(item, index) in exhaustFluid"
                    class="maintain-table__row"
                    :class="{'row--secondary': index % 2}"
                    :key="index">
                    {{ dateToFormat(item) }}
                </div>
            </div>
        </div>
        <div slot="footer">
            <Button class="btn w-100"
                    @click.stop="show = false">
                    {{ $t('OK') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'MaintainDetailModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        vehicle: {
            type: Object
        }
    },
    data() {
        return {
            vehicleMaintain: [],
            blakeFluid: [],
            engineOil: [],
            exhaustFluid: [],
            info: [],
            show: false
        }
    },
    methods: {
        setInfo(data) {
            const arrival_date = data?.custom?.arrival_date
                ? this.dateToFormat(data.custom.arrival_date)
                : '-'
            const create_time = data?.create_time
                ? this.dateToFormat(data.create_time)
                : '-'
            const remark = data?.custom?.check?.remark
                ? data.custom.check.remark
                : '-'
            this.info = [
                {
                    // 生產編號
                    label: `${this.$t('Produce')}${this.$t('ID')}`,
                    value: data?.origin_id ? data.origin_id : '-'
                },
                {
                    // 底盤編號
                    label: `${this.$t('Chassis')}${this.$t('ID')}`,
                    value: data?.name ? data.name : '-'
                },
                {
                    // QRcode
                    label: 'QRcode',
                    value: data?.barcode ? data.barcode : '-'
                },
                {
                    // 建立日期
                    label: `${this.$t('Create')}${this.$t('Date')}`,
                    value: create_time
                },
                {
                    // 到港日期
                    label: this.$t('ArrivalDate'),
                    value: arrival_date
                },
                {
                    // 註記
                    label: this.$t('RemarksA'),
                    value: remark
                }
            ]
        },
        setMaintain(data) {
            if (!data?.custom?.v_maintain) return
            const maintain = data.custom.v_maintain
            this.vehicleMaintain = maintain?.vehicle_maintain
                ? maintain.vehicle_maintain
                : []
            this.blakeFluid = maintain?.blake_fluid
                ? maintain.blake_fluid
                : []
            this.engineOil = maintain?.engine_oil
                ? maintain.engine_oil
                : []
            this.exhaustFluid = maintain?.exhaust_fluid
                ? maintain.exhaust_fluid
                : []
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            this.$emit('input', data)
        },
        vehicle(data) {
            this.setInfo(data)
            this.setMaintain(data)
        }
    }
}
</script>