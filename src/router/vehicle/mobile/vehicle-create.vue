<template>
    <div class="view">
        <Header :title="`${$t('Create')}${$t('VehicleInfo')}`"/>
        <Form label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- 生產編號 -->
            <FormItem class="mb-20"
                :label="`${$t('Produce')}${$t('ID')}`">
                <template v-if="cameraSacn">
                    <Input v-model="form.origin_id"
                        readonly
                        :placeholder="$t('PlaceHolder.ScanProductID')"
                        @on-focus="handleFocus('origin_id'); cameraOn = true"/>
                </template>
                <template v-else>
                    <Input v-model="form.origin_id"
                        clearable
                        :placeholder="$t('PlaceHolder.ScanProductID')"
                        @on-enter="focusOn('#chassis-input')"/>
                </template>
            </FormItem>
            <!-- 底盤編號 -->
            <FormItem class="mt-10 mb-0"
                :label="`${$t('Chassis')}${$t('ID')}`">
                <template v-if="cameraSacn">
                    <Input v-model="form.name"
                        readonly
                        :placeholder="$t('PlaceHolder.ScanChassisID')"
                        @on-focus="handleFocus('name'); cameraOn = true"/>
                </template>
                <template v-else>
                    <Input v-model="form.name"
                        clearable
                        element-id="chassis-input"
                        :placeholder="$t('PlaceHolder.ScanChassisID')"
                        @on-enter="focusOn('#qrcode-input')"/>
                </template>
            </FormItem>
            <!-- QRcode -->
            <FormItem class="mt-10 mb-0"
                :label="'QRcode'">
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
        <div class="c-divider mt-30 mb-10">
            <hr>
            <div class="c-divider__title">
                <!-- 點收 -->
                {{ $t('Receive') }}
            </div>
        </div>
        <template v-for="(item, index) in form.receive">
            <Checkbox v-if="item.key === 'keys'"
                v-model="item.status"
                class="mb-20"
                :key="index">
                <!-- 鑰匙 -->
                {{ $t('Key') }}
                <InputNumber v-model="item.value"
                    class="w-80 mr-5 ml-5"
                    :min="0"
                    :disabled="!item.status"/>
            </Checkbox>
            <Checkbox v-else-if="item.key === 'license_frame'"
                v-model="item.status"
                class="mb-20"
                :key="index">
                <!-- 車牌架 -->
                {{ `${$t('LicenseFrame')}：` }}
                <Input v-model="item.value"
                class="w-100"
                :disabled="!item.status"/>
                <!-- 及腳踏墊 -->
                {{ `${$t('AndA')}${$t('FootPad')}` }}
            </Checkbox>
            <Checkbox v-else v-model="item.status"
                class="mb-20"
                :key="index">
                {{ item.label }}
            </Checkbox>
        </template>
        <hr>
        <Checkbox v-model="form.reconfirm.status"
                class="mt-10 mb-20">
                {{ $t('Reconfirm') }}
        </Checkbox>
        <Input v-if="form.reconfirm.status === true"
            v-model="form.reconfirm.remark"
            class="mb-20"
            type="textarea"
            :placeholder="`${$t('PlaceHolder.ReconfirmRemark')}...`"
            :autosize="{ minRows: 2 }"/>
        <!-- 附件上傳 -->
        <Upload multiple
            :format="['jpg','jpeg','png']"
            :headers="{'X-CSRFToken':csrfToken}"
            :data="uploadParmas"
            :action="actionPath"
            :before-upload="beforeUpload">
            <Button icon="ios-camera">
                <!-- 拍照或上傳圖片 -->
                {{ $t('PhotoOrUpload') }}
            </Button>
        </Upload>
        <div v-for="(item, index) in file"
            class="fz--primary mb-5"
            :key="item.name + index">
            <Icon type="md-image" />
            {{ item.name }}
        </div>
        <Scanner v-model="cameraOn"
            @on-decode="getScannerData"/>
        <div class="footer">
            <Button class="btn w-100"
                :disabled="disableCreate()"
                :loading="apiLoading"
                @click="handleCreate()">
                {{ $t('Create') }}
            </Button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'VehicleCreate',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Scanner: resolve => require(['@/components/scanner.vue'], resolve)
    },
    data() {
        return {
            csrfToken: this.$store.state.csrfToken,
            actionPath: this.$store.state.backendUrl + '/1/pm/c/others/images/upload/',
            allowFormat: ['jpg', 'png', 'jpeg'],
            file: [],
            uid: '',
            uploadParmas: {},
            form: {
                name: '',
                origin_id: '',
                barcode: '',
                receive: [
                    {
                        // 鑰匙
                        key: 'keys',
                        value: 0,
                        status: false
                    },
                    {
                        // 交車禮、牌照登記書
                        key: 'registration_form',
                        label: this.$t('RegistrationForm'),
                        status: false
                    },
                    {
                        // 三角警示牌
                        key: 'warning_triangle',
                        label: this.$t('WarningTriangle'),
                        status: false
                    },
                    {
                        // 天線、音源線
                        key: 'antenna',
                        label: this.$t('Antenna'),
                        status: false
                    },
                    {
                        // 車牌架: ___ 及腳踏墊
                        key: 'license_frame',
                        value: '',
                        status: false
                    },
                    {
                        // 點菸器
                        key: 'car_lighter',
                        label: this.$t('CarLighter'),
                        status: false
                    },
                    {
                        // 車主手冊、急救包
                        key: 'owner_manual',
                        label: this.$t('OwnerManual'),
                        status: false
                    },
                    {
                        // 置物籃、掛網
                        key: 'storage_basket',
                        label: this.$t('StorageBasket'),
                        status: false
                    },
                    {
                        // 前檔油膜清除劑
                        key: 'film_remover',
                        label: `${this.$t('FilmRemover')} x 3`,
                        status: false
                    },
                    {
                        // 拖車勾
                        key: 'trailer_hook',
                        label: this.$t('TrailerHook'),
                        status: false
                    },
                    {
                        // 啟動按鈕
                        key: 'start_button',
                        label: this.$t('StartButton'),
                        status: false
                    },
                    {
                        // SD卡
                        key: 'sd_card',
                        label: this.$t('SdCard'),
                        status: false
                    },
                    {
                        // 打氣機、補胎劑
                        key: 'pump',
                        label: this.$t('Pump'),
                        status: false
                    }
                ],
                reconfirm: {
                    status: false,
                    remark: ''
                }
            },
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
        async handleCreate() {
            await this.createVehicle()
            if (this.file.length === 0) return
            this.uploadFile()
        },
        createVehicle() {
            this.apiLoading = true
            // 中古車可能沒有生產編號 (origin_id)
            if (this.form.name && !this.form.origin_id)
                this.form.origin_id = this.form.name
            const receive = this.form.receive
                .reduce((acc, crr) => {
                    if (crr.key === 'keys' && crr.status && crr.value > 0)
                        acc.keys = crr.value
                    else if (crr.key === 'license_frame' && crr.status)
                        acc.license_frame = crr.value
                    else acc[crr.key] = crr.status
                    return acc
                }, { keys: 0, license_frame: '' })
            const postObj = {
                name: this.form.name.toString(),
                origin_id: this.form.origin_id.toString(),
                barcode: this.form.barcode.toString(),
                custom: JSON.stringify({
                    reconfirm: this.form.reconfirm,
                    receive: receive,
                    v_maintain: {
                        vehicle_maintain: [],
                        blake_fluid: [],
                        engine_oil: [],
                        exhaust_fluid: []
                    }
                })
            }
            const config = {
                method: 'post',
                path: '/1/pm/c/v/create/',
                obj: postObj,
                success: this.createVehicleSuccess,
                error: this.createVehicleError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        createVehicleSuccess(response) {
            const uid = response?.data?.id
            this.uid = uid
            const content = this.$t('Create') + this.$t('Success')
            this.$Message.success(content)
            this.resetData()
        },
        createVehicleError(response) {
            let errMsg = this.$t('Error.CreateVehicle.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供車輛識別碼或原始識別碼
                case 1:
                    errMsg += this.$t('Error.CreateVehicle.Code1')
                    break
                // 此車輛識別碼已建立
                case 2:
                    errMsg += this.$t('Error.CreateVehicle.Code2')
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
            this.form.name = ''
            this.form.origin_id = ''
            this.form.barcode = ''
            this.form.receive = this.form.receive
                .map(item => {
                    if (item.key === 'keys')
                        item.value = 0
                    else if (item.key === 'license_frame')
                        item.value = ''
                    item.status = false
                    return item
                })
            this.form.reconfirm.status = false
            this.form.reconfirm.remark = ''
        },
        disableCreate() {
            if (!this.form.name) return true
            if (!this.form.barcode) return true
            return false
        },
        beforeUpload(file) {
            if (!file) return false
            const MB = 1024 * 1024
            const size = 5
            const limit = size * MB
            if (file.size > limit) {
                this.$Modal.warning({
                    title: this.$t('Notice.UploadExceedFileSizeB'),
                    content: this.$t('Notice.UploadExceedFileSizeA') + `${size} MB`,
                    okText: this.$t('OK')
                })
                return false
            }
            const [fileType] = file.type.split('/')
            if (fileType !== 'image') {
                const allow = this.allowFormat.join(', ')
                this.$Modal.warning({
                    title: this.$t('Notice.UploadIncorrectFormatB'),
                    content: this.$t('Notice.UploadIncorrectFormatA') + allow,
                    okText: this.$t('OK')
                })
                return false
            }
            this.file.push(file)
            return false
        },
        uploadFile() {
            if (!this.uid) return
            this.apiLoading = true
            const sec = 1000
            const fromData = new FormData()
            fromData.append('id', this.uid)
            this.file.forEach(file => fromData.append('file', file))
            const config = {
                method: 'post',
                path: '/1/pm/c/others/images/upload/',
                fromData: fromData,
                timeout: 60 * sec,
                success: () => { this.file = [] },
                error: this.uploadFileError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        }
    },
    computed: {
        cameraSacn() {
            return this.$store.state.cameraScan
        }
    }
}
</script>