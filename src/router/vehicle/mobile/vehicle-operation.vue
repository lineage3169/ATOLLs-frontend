<template>
    <div class="view">
        <!-- 車輛作業 -->
        <Header :title="`${$t('Vehicle')}${$t('Operation')}`"/>
        <Form v-show="view === 'LIST'"
            label-position="top"
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
                @click="produceId = item.origin_id; getData()">
                {{ item.origin_id.slice(0, -5) }}
                <span style="font-size: 20px; font-weight: bold;">
                    {{ item.origin_id.slice(-5) }}
                </span>
            </div>
        </div>
        <!-- 查詢結果 -->
        <div v-if="resultData.length > 0 && view === 'RESULT'"
            class="info-result mt-20">
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
        <!-- 作業 -->
        <div v-for="(item, index) in operation"
            class="operation-btn mb-15"
            :class="{ 'operation-btn--done' : item.status}"
            :key="index"
            @click="handleClick(item)">
            <div class="operation-btn__label">
                {{ item.label }}
            </div>
            <div class="operation-btn__time">
                {{ item.time }}
            </div>
            <div class="operation-btn__info">
                <Icon v-if="item.status" type="md-checkmark-circle" />
                <Icon v-else type="md-remove-circle" />
            </div>
        </div>
        <div class="footer">
            <Button v-show="view === 'RESULT'"
                class="btn btn--outline w-100"
                @click.stop="back()">
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
        <Confirm v-model="confirmShow"
            :msg="confirmMsg"
            :error="confirmType === 'DELETE'"
            :loading="apiLoading"
            :on-ok="handleConfirm"/>
    </div>
</template>
<script>
import Confirm from '@/components/modal/confirm/confirm.vue'
export default {
    name: 'VehicleOperation',
    components: {
        Confirm,
        Header: resolve => require(['@/components/m-header.vue'], resolve)
    },
    data() {
        return {
            form: {
                produceId: ''
            },
            produceId: '',
            custom: {},
            resultData: [],
            operation: [],
            list: [],
            uid: '',
            confirmType: 'UPDATE',
            view: 'LIST',
            msg: '',
            confirmMsg: '',
            selectItem: null,
            apiLoading: false,
            confirmShow: false
        }
    },
    methods: {
        getList() {
            this.resetData()
            this.apiLoading = true
            const config = {
                method: 'get',
                obj: { object_id: this.form.produceId },
                path: '/1/pm/c/v/list/get',
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
        getData() {
            this.apiLoading = true
            if (!this.produceId) return
            const config = {
                method: 'get',
                obj: { search_id: this.produceId },
                path: '/1/pm/c/search/general/get/',
                success: this.getDataSuccess,
                error: this.pmSearchError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const [data] = response.data.data
            const { custom: { operation = {} } } = data
            const { car_detailing = '' } = operation
            const { parts = '' } = operation
            const { pdi = '' } = operation
            const { window_tint = '' } = operation
            this.custom = { operation: operation }
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
                }
            ]
            this.resultData = result.map(item => {
                item.content = item.content ? item.content : '-'
                return item
            })
            this.operation = [
                {
                    // PDI / 洗車
                    keys: 'pdi',
                    label: this.$t('PDI'),
                    time: this.dateToFormat(pdi),
                    status: !!pdi
                },
                {
                    // 隔熱紙
                    keys: 'window_tint',
                    label: this.$t('WindowTint'),
                    time: this.dateToFormat(window_tint),
                    status: !!window_tint
                },
                {
                    // 配件
                    keys: 'parts',
                    label: this.$t('Parts'),
                    time: this.dateToFormat(parts),
                    status: !!parts
                },
                {
                    // 美容 / 鍍膜
                    keys: 'car_detailing',
                    label: this.$t('CarDetailing'),
                    time: this.dateToFormat(car_detailing),
                    status: !!car_detailing
                }
            ]
            this.uid = data.id
            this.view = 'RESULT'
        },
        handleClick(item) {
            this.selectItem = item
            if (item.time) {
                // 刪除工作項目
                this.confirmType = 'DELETE'
                this.confirmMsg = `${this.$t('DeleteOperation')}"${item.label}"?`
            }
            else {
                // 完成工作項目
                this.confirmType = 'UPDATE'
                this.confirmMsg = `${this.$t('DoneOperation')}"${item.label}"?`
            }
            this.confirmShow = true
        },
        handleConfirm() {
            this.apiLoading = true
            const item = this.selectItem
            const key = item.keys
            const day = new Date()
            const time = this.dateToFormat(day, true, true)
            if (this.confirmType === 'UPDATE')
                this.custom.operation[key] = time
            else if (this.confirmType === 'DELETE')
                this.custom.operation[key] = ''
            const obj = {
                id: this.uid,
                custom: JSON.stringify(this.custom)
            }
            const config = {
                method: 'post',
                obj: obj,
                path: '/1/pm/c/v/operation/update/',
                success: () => this.getData(),
                error: this.confirmError,
                final: () => {
                    this.apiLoading = false
                    this.confirmShow = false
                }
            }
            this.ajax(config)
        },
        confirmError(response) {
            let errMsg = this.$t('Error.OperationUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 車輛不存在
                case 1:
                    errMsg += this.$t('Error.OperationUpdate.Code1')
                    break
                // 自定義項目不存在
                case 2:
                    errMsg += this.$t('Error.OperationUpdate.Code2')
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
            this.msg = ''
            this.list = []
        },
        back() {
            this.view = 'LIST'
            this.operation = []
        }
    }
}
</script>