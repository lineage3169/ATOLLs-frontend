<template>
    <Modal v-model="show"
        class="maintain-check-modal"
        :width="500">
        <div slot="header" class="fz--large">
            {{ $t('Check') }}
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
            <div class="info__item">
                <div class="info__item__label">
                    {{ $t('Checking') }}
                </div>
                <div class="info__item__content">
                    <i-switch v-model="check" />
                </div>
            </div>
        </div>
        <div class="remark">
            <div class="remark__label">
                {{ $t('RemarksA') }}
            </div>
            <div class="remark__content">
                <i-input v-model="remark"
                    type="textarea"
                    :disabled="!check"/>
            </div>
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
export default {
    name: 'MaintainCheckModal',
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
            remark: '',
            check: false,
            info: [],
            show: false,
            apiLoading: false
        }
    },
    methods: {
        resetData() {
            this.check = false
            this.remark = ''
        },
        setInfo(data) {
            this.resetData()
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
                }
            ]
            if (data?.custom?.check?.status)
                this.check = true
            if (data?.custom?.check?.remark)
                this.remark = data.custom.check.remark
        },
        save() {
            this.apiLoading = true
            const obj = this.getPostData()
            const config = {
                method: 'post',
                path: '/1/pm/c/v/check/update/',
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
            return {
                id: this.vehicle.id,
                custom: JSON.stringify({
                    check: {
                        status: this.check,
                        remark: this.check && this.remark ? this.remark : ''
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
        }
    }
}
</script>