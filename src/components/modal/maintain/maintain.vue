<template>
    <Modal v-model="show"
        class="maintain-modal"
        :width="300">
        <div slot="header" class="fz--large">
            {{ $t('MaintenanceA') }}
        </div>
        <p class="mb-30">
            {{ `${$t('MaintenanceA')}${$t('Item')}`}} "<span class="txt-color--error">{{ item }}</span>"?
        </p>
        <p class="mb-10">{{ `${$t('Produce')}${$t('ID')}` }}</p>
        <i-input v-model="produceId"
            :placeholder="$t('PlaceHolder.OperationsIdLastFive')"/>
        <div slot="footer">
            <Button size="large"
                    class="btn btn--outline w-100"
                    @click.stop="show = false">
                    {{$t('Cancel')}}
            </Button>
            <Button size="large"
                    class="btn w-100"
                    :loading="apiLoading"
                    :disabled="produceId !== produceIdCheck"
                    @click.stop="save()">
                    {{$t('Save')}}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'MaintainModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        vehicle: {
            type: Object
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            item: '',
            produceId: '',
            produceIdCheck: '',
            show: false,
            apiLoading: false
        }
    },
    methods: {
        save() {
            this.apiLoading = true
            const obj = this.getPostData()
            const config = {
                method: 'post',
                path: '/1/pm/c/v/maintain/update/',
                obj: obj,
                success: () => {
                    this.$emit('on-save')
                    this.show = false
                },
                error: this.saveError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        saveError(response) {
            let errMsg = this.$t('Error.VahicleEdit.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 車輛不存在
                case 1:
                    errMsg += this.$t('Error.VahicleEdit.Code1')
                    break
                // 車輛自定義項目不存在
                case 2:
                    errMsg += this.$t('Error.VahicleEdit.Code2')
                    break
                // 缺少必要項目： 目標id與custom
                case 3:
                    errMsg += this.$t('Error.VahicleEdit.Code3')
                    break
                default:
                    errMsg += `${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        getPostData() {
            const now = new Date()
            const date = this.dateToFormat(now, true, true)
            const maintain = this.vehicle?.custom?.v_maintain
                ? this.vehicle.custom.v_maintain
                : {}
            const vehicle_maintain = maintain?.vehicle_maintain
                ? maintain.vehicle_maintain
                : []
            const blake_fluid = maintain?.blake_fluid
                ? maintain.blake_fluid
                : []
            const engine_oil = maintain?.engine_oil
                ? maintain.engine_oil
                : []
            const exhaust_fluid = maintain?.exhaust_fluid
                ? maintain.exhaust_fluid
                : []
            switch (this.type) {
            case 'VM':
                vehicle_maintain.push(date)
                break
            case 'BF':
                blake_fluid.push(date)
                break
            case 'EO':
                engine_oil.push(date)
                break
            case 'EF':
                exhaust_fluid.push(date)
                break
            default:
                break
            }
            return {
                id: this.vehicle.id,
                custom: JSON.stringify({
                    v_maintain: {
                        vehicle_maintain: vehicle_maintain,
                        blake_fluid: blake_fluid,
                        engine_oil: engine_oil,
                        exhaust_fluid: exhaust_fluid
                    }
                })
            }
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
            this.produceId = ''
            this.produceIdCheck = data.origin_id.slice(-5)
        },
        type(data) {
            switch (data) {
            case 'VM':
                // 車輛維護
                this.item = `${this.$t('Vehicle')}${this.$t('Maintenance')}`
                break
            case 'BF':
                // 剎車油
                this.item = this.$t('BlakeFluid')
                break
            case 'EO':
                // 機油
                this.item = this.$t('EngineOil')
                break
            case 'EF':
                // 尿素
                this.item = this.$t('ExhaustFluid')
                break
            default:
                break
            }
        }
    }
}
</script>