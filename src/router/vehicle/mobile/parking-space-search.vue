<template>
    <div class="view">
        <Header :title="$t('ParkingSpace') + $t('Search')"/>
        <template v-if="!result">
            <Form label-position="top"
                :model="form"
                @keydown.native.enter.prevent="">
                <!-- 車位識別碼 -->
                <FormItem class="mb-0"
                    :label="$t('ParkingSpace') + $t('IDA')">
                    <template v-if="cameraSacn">
                        <Input v-model="form.spaceId"
                            readonly
                            :placeholder="$t('PlaceHolder.ScanParkingSpace')"
                            @on-focus="handleFocus('spaceId'); cameraOn = true"/>
                    </template>
                    <template v-else>
                        <Input v-model="form.spaceId"
                            clearable
                            :placeholder="$t('PlaceHolder.ScanParkingSpace')"/>
                    </template>
                </FormItem>
            </Form>
            <Scanner v-model="cameraOn"
                @on-decode="getScannerData"/>
            <div class="footer">
                <Button class="btn w-100"
                    :disabled="disableGetInfo()"
                    :loading="apiLoading"
                    @click.stop="getSpaceInfo">
                    {{ $t('Search') }}
                </Button>
            </div>
        </template>
        <template v-else>
            <!-- 查詢結果 -->
            <template v-if="psResultData">
                <!-- 車輛 -->
                <div class="info-result mt-30">
                    <div v-for="(item, index) in psResultData"
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
            </template>
            <template v-if="vResultData">
                <div class="c-divider mb-10">
                    <hr>
                    <div class="c-divider__title">
                        <!-- 車輛 -->
                        {{ $t('Vehicle') }}
                    </div>
                </div>
                <div class="info-result">
                    <div v-for="(item, index) in vResultData"
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
            </template>
            <div class="footer">
                <!-- 重新查詢 -->
                <Button class="btn w-100"
                    @click.stop="reset">
                    {{ $t('SearchAgain') }}
                </Button>
            </div>
        </template>
    </div>
</template>
<script>
export default {
    name: 'ParkingSpaceSearch',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Scanner: resolve => require(['@/components/scanner.vue'], resolve)
    },
    data() {
        return {
            form: {
                spaceId: ''
            },
            result: false,
            psResultData: null,
            vResultData: null,
            cameraOn: false,
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
        getSpaceInfo() {
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/pm/c/ps/get/',
                obj: { ps_name: this.form.spaceId },
                success: this.getSpaceInfoSuccess,
                error: this.getSpaceInfoError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getSpaceInfoSuccess(response) {
            if (!response?.data?.data) {
                const content = this.$t('NoData')
                this.errorModal(content)
                return
            }
            const { data: { data } } = response
            // 車位
            this.psResultData = [
                {
                    // 車位識別碼
                    label: `${this.$t('ParkingSpace')}${this.$t('IDA')}`,
                    content: data.barcode ? data.barcode : '-'
                },
                {
                    // 狀態
                    label: this.$t('Status'),
                    content: data.v_info ? this.$t('Used') : this.$t('Unuse')
                }
            ]
            // 車輛
            if (data?.v_info) {
                this.vResultData = [
                    {
                        // 生產編號
                        label: `${this.$t('Produce')}${this.$t('ID')}`,
                        content: data.v_info?.origin_id ? data.v_info.origin_id : '-'
                    },
                    {
                        // 底盤編號
                        label: `${this.$t('Chassis')}${this.$t('ID')}`,
                        content: data.v_info?.name ? data.v_info.name : '-'
                    },
                    {
                        // QRcode
                        label: 'QRcode',
                        content: data.v_info?.barcode ? data.v_info.barcode : '-'
                    }
                ]
            }
            this.result = true
        },
        getSpaceInfoError(response) {
            // 取得停車位資訊失敗
            let errMsg = this.$t('Error.GetSpaceInfo.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供停車位識別碼
                case 1:
                    errMsg += this.$t('Error.GetSpaceInfo.Code1')
                    break
                // 查無此停車位
                case 2:
                    errMsg += this.$t('Error.GetSpaceInfo.Code2')
                    break
                // 發現多筆相同的識別碼
                case 3:
                    errMsg += this.$t('Error.GetSpaceInfo.Code3')
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
        disableGetInfo() {
            if (!this.form.spaceId) return true
            return false
        },
        reset() {
            this.result = false
            this.psResultData = null
            this.vResultData = null
        }
    },
    computed: {
        cameraSacn() {
            return this.$store.state.cameraScan
        }
    }
}
</script>