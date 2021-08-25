<template>
    <div class="view">
        <Header :title="`${$t('Create')}${$t('ParkingSpace')}`"/>
        <Form label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- 區域 -->
            <FormItem :label="$t('Area')">
                <Select v-model="form.areaId"
                    filterable
                    :placeholder="$t('PlaceHolder.QuickSearch')">
                    <Option v-for="(item, index) in areaList"
                        :value="item.value"
                        :key="index">{{ item.label }}</Option>
                </Select>
            </FormItem>
            <!-- 車位識別碼 -->
                <FormItem class="mt-10 mb-0"
                    :label="`${$t('ParkingSpace')}${$t('IDA')}`">
                    <template v-if="cameraSacn">
                        <Input v-model="form.spaceId"
                            readonly
                            :placeholder="`${$t('PlaceHolder.ScanParkingSpace')}`"
                            @on-focus="handleFocus('spaceId'); cameraOn = true"/>
                    </template>
                    <template v-else>
                        <Input v-model="form.spaceId"
                            clearable
                            :placeholder="`${$t('PlaceHolder.ScanParkingSpace')}`"/>
                    </template>
                </FormItem>
        </Form>
        <Scanner v-model="cameraOn"
            @on-decode="getScannerData"/>
        <div class="footer">
            <Button class="btn w-100"
                :disabled="disableCreate()"
                :loading="apiLoading"
                @click.stop="createSpace()">
                {{ $t('Create') }}
            </Button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ParkingSpaceCreate',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        Scanner: resolve => require(['@/components/scanner.vue'], resolve)
    },
    data() {
        return {
            form: {
                areaId: '',
                spaceId: ''
            },
            areaList: [],
            cameraOn: false,
            apiLoading: false
        }
    },
    created() {
        this.getArea()
    },
    methods: {
        getScannerData(data) {
            const key = this.$store.state.focusItem
            this.form[key] = ''
            this.form[key] = data
            window.scrollTo(0, 0)
        },
        getArea() {
            const config = {
                method: 'get',
                path: '/1/pm/c/pg/get/',
                success: this.getAreaSuccess,
                error: this.getAreaError
            }
            this.ajax(config)
        },
        getAreaSuccess(response) {
            if (!response.data.data || response.data.data.length === 0)
                return
            const data = this.deepCopy(response.data.data)
            this.areaList = data.map(item => {
                return { label: item.name, value: item.id }
            })
        },
        getAreaError(response) {
            let errMsg = this.$t('Error.GetArea.General') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        createSpace() {
            this.apiLoading = true
            const config = {
                method: 'post',
                path: '/1/pm/c/ps/create/',
                obj: {
                    pg_id: this.form.areaId,
                    ps_name: this.form.spaceId
                },
                success: this.createSpaceSuccess,
                error: this.createSpaceError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        createSpaceSuccess() {
            const content = this.$t('Create') + this.$t('Success')
            this.$Message.success(content)
            this.resetData()
        },
        createSpaceError(response) {
            let errMsg = this.$t('Error.CreateSpace.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供停車區域或停車位識別碼
                case 1:
                    errMsg += this.$t('Error.CreateSpace.Code1')
                    break
                // 查無停車區域
                case 2:
                    errMsg += this.$t('Error.CreateSpace.Code2')
                    break
                // 停車位已建立 (重複建立停車位)
                case 3:
                    errMsg += this.$t('Error.CreateSpace.Code3')
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
        disableCreate() {
            if (!this.form.areaId) return true
            if (!this.form.spaceId) return true
            return false
        },
        resetData() {
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