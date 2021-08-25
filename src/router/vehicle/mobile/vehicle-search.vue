<template>
    <div class="view">
        <Header :title="$t('Vehicle') + $t('Search')"/>
        <Form label-position="top"
            :model="form"
            @keydown.native.enter.prevent="">
            <!-- 生產編號 -->
            <FormItem class="mb-10"
                :label="$t('Produce') + $t('ID')" >
                <Input v-model="form.produceId"
                    clearable
                    :placeholder="$t('PlaceHolder.OperationsIdLastFive')" />
            </FormItem>
        </Form>
        <!-- 訊息 -->
        <div v-if="msg" class="error-msg">
            {{ msg }}
        </div>
        <!-- 列表 -->
        <div v-if="list.length > 0 && view === 'LIST'" class="id-list">
            <div v-for="(item, index) in list"
                class="id-list__item"
                :key="index"
                @click="getPosition(item.origin_id)">
                {{ item.origin_id.slice(0, -5) }}
                <span style="font-size: 20px; font-weight: bold;">
                    {{ item.origin_id.slice(-5) }}
                </span>
            </div>
        </div>
        <!-- 查詢結果 -->
        <div v-if="resultData.length > 0 && view === 'RESULT'"
            class="info-result mt-30">
            <div v-for="(item, index) in resultData"
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
        <div class="footer">
            <Button v-show="view === 'RESULT'"
                class="btn btn--outline w-100"
                @click.stop="view = 'LIST'">
                {{ $t('Back') }}
            </Button>
            <Button v-show="view === 'LIST'"
                class="btn w-100"
                :loading="apiLoading"
                :disabled="!form.produceId || form.produceId.length !== 5"
                @click.stop="getList()">
                {{ $t('Search') }}
            </Button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'VehicleSearch',
    components: {
        Header: resolve => require(['@/components/m-header.vue'], resolve)
    },
    data() {
        return {
            form: {
                produceId: ''
            },
            resultData: [],
            list: [],
            view: 'LIST',
            msg: '',
            apiLoading: false
        }
    },
    methods: {
        getList() {
            this.msg = ''
            this.apiLoading = true
            const config = {
                method: 'get',
                obj: { object_id: this.form.produceId },
                path: '1/pm/c/v/list/get',
                success: this.getListSuccess,
                error: this.getVehicleListError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getListSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            if (data.length > 0) this.list = this.deepCopy(data)
            else this.msg = this.$t('NoData')
        },
        getPosition(originId) {
            this.msg = ''
            this.apiLoading = true
            const config = {
                method: 'get',
                obj: { object_id: originId },
                path: '/1/pm/c/v/get/',
                success: this.getPositionSuccess,
                error: this.getPositionError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getPositionSuccess(response) {
            if (!response?.data?.data) return
            const data = this.deepCopy(response.data.data)
            const result = [
                // 生產編號
                {
                    label: `${this.$t('Produce')}${this.$t('ID')}`,
                    content: data?.origin_id
                },
                // 底盤編號
                {
                    label: `${this.$t('Chassis')}${this.$t('ID')}`,
                    content: data?.name
                },
                // 建立時間
                {
                    label: `${this.$t('Create')}${this.$t('Date')}`,
                    content: data?.create_time ? this.dateToFormat(data?.create_time) : null
                },
                // 區域
                {
                    label: this.$t('ParkingArea'),
                    content: data?.pg_info?.name
                },
                // 車位識別碼
                {
                    label: `${this.$t('ParkingSpace')}${this.$t('IDA')}`,
                    content: data?.ps_info?.name
                }
            ]
            this.resultData = result.map(item => {
                item.content = item.content ? item.content : '-'
                return item
            })
            this.view = 'RESULT'
        },
        getPositionError(response) {
            // 取得車輛資訊失敗
            let errMsg = this.$t('Error.GetPosition.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供車輛識別碼
                case 1:
                    errMsg += this.$t('Error.GetPosition.Code1')
                    break
                // 查無此車輛
                case 2:
                    errMsg += this.$t('Error.GetPosition.Code2')
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
    }
}
</script>