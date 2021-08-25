<template>
    <div class="view">
        <!-- 出庫 -->
        <Header :title="$t('LeavingCarBarn')"/>
        <Form label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- QRcode -->
            <FormItem class="mb-10"
                label="QRcode" >
                <template v-if="cameraSacn">
                    <Input v-model="form.barcode"
                        readonly
                        :placeholder="$t('PlaceHolder.ScanQRcode')"
                        @on-focus="handleFocus('barcode'); cameraOn = true"/>
                </template>
                <template v-else>
                    <Input v-model="form.barcode"
                        clearable
                        element-id="qrcode-input"
                        :placeholder="$t('PlaceHolder.ScanQRcode')"/>
                </template>
            </FormItem>
        </Form>
        <div class="footer">
            <Button class="btn w-100"
                :disabled="!form.barcode"
                :loading="apiLoading"
                @click="leaving()">
                {{ $t('LeavingCarBarn') }}
            </Button>
        </div>
        <Scanner v-model="cameraOn"
            @on-decode="getScannerData"/>
    </div>
</template>
<script>
export default {
    name: 'VehicleLeaving',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Scanner: resolve => require(['@/components/scanner.vue'], resolve)
    },
    data() {
        return {
            form: {
                barcode: ''
            },
            cameraOn: false,
            vehicle: null,
            isMoveOut: false,
            apiLoading: false
        }
    },
    methods: {
        getScannerData(data) {
            const key = this.$store.state.focusItem
            this.form[key] = ''
            this.form[key] = data
            window.scrollTo(0, 0)
        },
        getData() {
            this.apiLoading = true
            const obj = {
                search_id: this.form.barcode,
                type_code: 'V',
                progress: 'EG'
            }
            const config = {
                method: 'get',
                path: '/1/pm/c/search/general/get/',
                obj: obj,
                success: this.getDataSuccess,
                error: this.pmSearchError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const [data] = response.data.data
            this.vehicle = data
        },
        async leaving() {
            await this.getData()
            await this.moveOut()
            this.setProgress()
        },
        setProgress() {
            if (!this.isMoveOut) return
            this.apiLoading = true
            const successMsg = this.$t('Vehicle') +
                this.$t('Already') +
                this.$t('LeavingCarBarn')
            const config = {
                method: 'post',
                path: '/1/pm/c/v/progress/update/',
                obj: {
                    id: this?.vehicle?.id,
                    progress: 'LG'
                },
                success: () => {
                    this.form.barcode = ''
                    this.$Modal.success({
                        title: this.$t('Prompt'),
                        content: successMsg
                    })
                },
                error: this.setProgressError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        setProgressError(response) {
            let errMsg = this.$t('Error.Leaving.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 缺少必要條件
                case 1:
                    errMsg += this.$t('Error.Leaving.Code1')
                    break
                // 未提供進度
                case 2:
                    errMsg += this.$t('Error.Leaving.Code2')
                    break
                // 查無該車輛ID
                case 3:
                    errMsg += this.$t('Error.Leaving.Code3')
                    break
                // 查無該車輛客製化資訊
                case 4:
                    errMsg += this.$t('Error.Leaving.Code4')
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
        moveOut() {
            this.apiLoading = true
            this.isMoveOut = false
            const config = {
                method: 'post',
                path: '/1/pm/c/relation/move/out/',
                obj: {
                    object_id: this?.vehicle?.name,
                    group: '021'
                },
                success: () => { this.isMoveOut = true },
                error: this.moveOutError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        moveOutError(response) {
            let errMsg = this.$t('Error.MoveOut.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 找不到此車輛識別碼
                case 1:
                    errMsg += this.$t('Error.MoveOut.Code1')
                    break
                // 發現多筆相同的識別碼
                case 2:
                    errMsg += this.$t('Error.MoveOut.Code2')
                    break
                // 此車輛並未移入停車位
                case 3:
                    errMsg += this.$t('Error.MoveOut.Code3')
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
        }
    },
    computed: {
        cameraSacn() {
            return this.$store.state.cameraScan
        }
    }
}
</script>