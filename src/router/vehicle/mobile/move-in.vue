<template>
    <div class="view">
        <Header :title="$t('MoveIn') + $t('ParkingSpace')"/>
        <Form label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- 生產/底盤編號、QRcode -->
            <FormItem class="mb-20"
                :label="`${$t('Produce')} / ${$t('Chassis')}${$t('ID')}、QRcode`">
                <template v-if="cameraSacn">
                    <Input v-model="form.vehicleId"
                        readonly
                        :placeholder="$t('PlaceHolder.ScanVehicle')"
                        @on-focus="handleFocus('vehicleId'); cameraOn = true"/>
                </template>
                <template v-else>
                    <Input v-model="form.vehicleId"
                        clearable
                        :placeholder="$t('PlaceHolder.ScanVehicle')"
                        @on-enter="focusOn('#ps-input')"/>
                </template>
            </FormItem>
            <!-- 車位識別碼 -->
            <FormItem class="mt-10 mb-0"
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
                        element-id="ps-input"
                        :placeholder="$t('PlaceHolder.ScanParkingSpace')"/>
                </template>
            </FormItem>
        </Form>
        <Scanner v-model="cameraOn"
            @on-decode="getScannerData"/>
        <div class="footer">
            <Button class="btn w-100"
                :loading="apiLoading"
                :disabled="!form.vehicleId || !form.spaceId"
                @click.stop="moveIn()">
                {{ $t('MoveIn') }}
            </Button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'MoveIn',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Scanner: resolve => require(['@/components/scanner.vue'], resolve)
    },
    data() {
        return {
            form: {
                vehicleId: '',
                spaceId: ''
            },
            parkingSpace: '',
            msg: '',
            spaceInfo: null,
            moveOutConfirm: false,
            warningShow: false,
            spaceUsed: false,
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
        moveIn() {
            this.apiLoading = true
            const postObj = {
                object_id: this.form.vehicleId,
                object_group: '021',
                belongs_id: this.form.spaceId,
                belongs_group: '021'
            }
            const config = {
                method: 'post',
                path: '/1/pm/c/relation/move/in/',
                obj: postObj,
                success: this.moveInSuccess,
                error: this.moveInError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        moveInSuccess() {
            const content = this.$t('MoveIn') + this.$t('Success')
            this.$Modal.success({
                title: this.$t('Prompt'),
                content: content
            })
            this.moveOutConfirm = false
            this.resetData()
        },
        moveInError(response) {
            let errMsg = this.$t('Error.MoveIn.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 找不到此車輛識別碼
                case 1:
                    errMsg += this.$t('Error.MoveIn.Code1')
                    break
                // 重複的車輛識別碼
                case 2:
                    errMsg += this.$t('Error.MoveIn.Code2')
                    break
                // 找不到此車位識別碼
                case 3:
                    errMsg += this.$t('Error.MoveIn.Code3')
                    break
                // 重複的車位識別碼
                case 4:
                    errMsg += this.$t('Error.MoveIn.Code4')
                    break
                // 此車位正在使用中
                case 5:
                    errMsg += this.$t('Error.MoveIn.Code5')
                    break
                // 移入物件層級錯誤
                case 6:
                    errMsg += this.$t('Error.MoveIn.Code6')
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
        resetData() {
            this.form.vehicleId = ''
            this.form.spaceId = ''
        }
    },
    computed: {
        cameraSacn() {
            return this.$store.state.cameraScan
        }
    }
}
</script>