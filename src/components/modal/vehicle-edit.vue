<template>
    <Modal v-model="show"
        class="vehcile-edit-modal"
        :width="650">
        <div slot="header" class="fz--large">
            {{`${$t('Edit')}${$t('Vehicle')}`}}
        </div>
        <div class="info pl-30 mb-10">
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
        <div class="form pl-30">
            <FormItems v-model="form"
                        :elements="condition"/>
        </div>
        <div slot="footer">
            <Button size="large"
                    class="btn btn--outline w-100"
                    @click.stop="show = false">
                    {{$t('Cancel')}}
            </Button>
            <Button size="large"
                    class="btn w-100"
                    :loading="apiLoading"
                    @click.stop="save()">
                    {{$t('Save')}}
            </Button>
        </div>
    </Modal>
</template>
<script>
import FormItems from '@/components/form-items.vue'
export default {
    name: 'VehicleEdit',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        vehicle: {
            type: Object
        }
    },
    components: { FormItems },
    data() {
        return {
            apiLoading: false,
            condition: [
                {
                    // 配額單位
                    label: `${this.$t('Quota')}${this.$t('Unit')}`,
                    model: 'quota',
                    optionMap: this.$store.state.quota,
                    placeholder: this.$t('PlaceHolder.PleaseChoose'),
                    type: 'select',
                    width: 150
                },
                {
                    // 初始配額單位
                    label: `${this.$t('Initial')}${this.$t('Quota')}${this.$t('Unit')}`,
                    model: 'quota_init',
                    optionMap: this.$store.state.quota,
                    placeholder: this.$t('PlaceHolder.PleaseChoose'),
                    type: 'select',
                    width: 150
                },
                {
                    // 到港日期
                    func: this.setDates,
                    label: this.$t('ArrivalDate'),
                    model: 'arrival_date',
                    placeholder: this.$t('PlaceHolder.SelectDate'),
                    type: 'datepicker',
                    width: 150
                },
                {
                    // 待複檢
                    label: this.$t('Reconfirm'),
                    model: 'reconfirm',
                    type: 'switch',
                    width: 150
                },
                {
                    // 備註
                    label: this.$t('Remarks'),
                    maxlength: 250,
                    model: 'remark',
                    rows: 3,
                    showLimit: true,
                    type: 'textarea',
                    width: 355
                }
            ],
            form: {
                arrival_date: '',
                quota: '',
                quota_init: '',
                reconfirm: false,
                remark: ''
            },
            info: [],
            show: false
        }
    },
    methods: {
        setData(data) {
            this.reset()
            const custom = data?.custom
            if (custom?.quota)
                this.form.quota = custom.quota
            if (custom?.quota_init)
                this.form.quota_init = custom.quota_init
            if (custom?.reconfirm) {
                if (typeof custom.reconfirm.status === 'boolean')
                    this.form.reconfirm = custom.reconfirm.status
                if (custom?.reconfirm?.remark)
                    this.form.remark = custom.reconfirm.remark
            }
            if (custom?.arrival_date)
                [this.form.arrival_date] = custom.arrival_date.split('T')
        },
        setDates(data, model) {
            const isNull = [...new Set(data)][0] === ''
            if (isNull) this.form[model] = ''
            else this.form[model] = this.deepCopy(data)
        },
        setInfo(data) {
            this.info = [
                {
                    // 生產編號
                    label: `${this.$t('Produce')}${this.$t('ID')}`,
                    value: data.origin_id
                },
                {
                    // 底盤編號
                    label: `${this.$t('Chassis')}${this.$t('ID')}`,
                    value: data.name
                },
                {
                    // QRcode
                    label: 'QRcode',
                    value: data.barcode
                },
                {
                    // 建立日期
                    label: `${this.$t('Create')}${this.$t('Date')}`,
                    value: this.dateToFormat(data.create_time)
                },
                {
                    // 停車區域
                    label: this.$t('ParkingArea'),
                    value: data?.pg_info?.name ? data.pg_info.name : '-'
                },
                {
                    // 車位識別碼
                    label: `${this.$t('ParkingSpace')}${this.$t('IDA')}`,
                    value: data?.ps_info?.barcode ? data.ps_info.barcode : '-'
                }
            ]
        },
        save() {
            this.apiLoading = true
            const obj = this.getPostData()
            const config = {
                method: 'post',
                path: '/1/pm/c/v/update/',
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
        reset() {
            this.form = {
                quota: '',
                quota_init: '',
                arrival_date: '',
                remark: '',
                reconfirm: false
            }
        },
        getPostData() {
            const arrivalDateString = `${this.form.arrival_date} 00:00:00`
            const arrival_date = this.dateToFormat(arrivalDateString, true, true)
            return {
                id: this.vehicle.id,
                custom: JSON.stringify({
                    quota: this.form.quota,
                    quota_init: this.form.quota_init,
                    arrival_date: arrival_date,
                    reconfirm: {
                        status: this.form.reconfirm,
                        remark: this.form.remark
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
            this.setInfo(data)
            this.setData(data)
        },
        form: {
            handler: function(newVal) {
                this.condition = this.condition
                    .map(item => {
                        if (item.model === 'remark')
                            item.disabled = !newVal.reconfirm
                        return item
                    })
            },
            deep: true
        }
    }
}
</script>