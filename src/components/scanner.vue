<template>
    <div v-if="cameraEnable" class="scanner" @click.stop="">
        <div class="header">
            <div class="close" @click.stop="cameraEnable = false">
                <Icon type="md-close" />
            </div>
        </div>
        <div v-if="scanType !== 'MANUAL'" class="camera">
            <div v-if="!loading" class="border">
                <div class="border__item border__item--left-top"></div>
                <div class="border__item border__item--right-top"></div>
                <div class="border__item border__item--left-bottom"></div>
                <div class="border__item border__item--right-bottom"></div>
            </div>
            <div v-show="loading" class="loader"></div>
            <qrcode-stream v-if="scanType === 'QRCODE'"
                :camera="'rear'"
                @init="onInit"
                @decode="onDecode"/>
            <StreamBarcodeReader v-else-if="scanType === 'BARCODE'"
                @decode="onDecode"
                @loaded="onLoaded"
                @error="onError"/>
        </div>
        <div v-else-if="scanType === 'MANUAL'" class="manual">
            <div class="manual__item">
                <div class="manual__item__label">
                    {{ $t('ManualA') }}
                </div>
                <div class="manual__item__input">
                    <input v-model="form.input" type="text">
                </div>
            </div>
            <div class="manual__footer">
                <Button class="btn--outline w-100 mr-10"
                    @click.stop="form.input = ''">
                    {{ $t('Reset') }}
                </Button>
                <Button class="btn w-100"
                    :disabled="!form.input"
                    @click.stop="onOK()">
                    {{ $t('OK') }}
                </Button>
            </div>
        </div>
        <div class="scanner__footer">
            <div v-for="(item, index) in footerList"
                class="scanner__footer__item"
                :class="{'scanner__footer__item--active' : item.isActive}"
                :key="index"
                @click.stop="handleType(index)">
                <div class="scanner__footer__item__icon">
                    <Icon :type="item.icon" />
                </div>
                <div class="scanner__footer__item__label">
                    {{ item.label }}
                </div>
            </div>
        </div>
    </div>
</template>
<script>
import { QrcodeStream } from 'vue-qrcode-reader'
import { StreamBarcodeReader } from 'vue-barcode-reader'
export default {
    name: 'Scanner',
    components: { QrcodeStream, StreamBarcodeReader },
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            form: {
                input: ''
            },
            footerList: [
                {
                    icon: 'md-qr-scanner',
                    label: this.$t('QRCodeA'),
                    type: 'QRCODE',
                    isActive: true
                },
                {
                    icon: 'ios-barcode-outline',
                    label: this.$t('BarcodeA'),
                    type: 'BARCODE',
                    isActive: false
                },
                {
                    icon: 'ios-hand',
                    label: this.$t('Manual'),
                    type: 'MANUAL',
                    isActive: false
                }
            ],
            cameraEnable: false,
            scanType: 'QRCODE',
            loading: false
        }
    },
    methods: {
        onOK() {
            this.$emit('on-decode', this.form.input)
            this.form.input = ''
            this.cameraEnable = false
        },
        onDecode(data) {
            this.$emit('on-decode', data)
            this.cameraEnable = false
        },
        async onInit(promise) {
            try {
                const { capabilities } = await promise
                if (capabilities) this.loading = false
            }
            catch (error) {
                this.errorModal(error.toString())
            }
        },
        onError(data) {
            this.errorModal(data.toString())
        },
        onLoaded() {
            this.loading = false
        },
        handleType(index = 0) {
            this.footerList = this.footerList.map((item, i) => {
                if (i === index) {
                    item.isActive = true
                    this.scanType = item.type
                }
                else item.isActive = false
                return item
            })
        }
    },
    watch: {
        value(data) {
            this.cameraEnable = data
        },
        cameraEnable(data) {
            this.$emit('input', data)
            if (data) {
                const temp = document.createElement('input')
                document.body.appendChild(temp)
                temp.focus()
                document.body.removeChild(temp)
                this.loading = true
            }
            else this.loading = false
        },
        scanType() {
            this.loading = true
        }
    }
}
</script>