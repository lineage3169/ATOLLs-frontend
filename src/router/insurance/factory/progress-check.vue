<template>
    <div class="p-progress-check">
        <div class="l-view">
            <div class="search-bar">
                <Form :label-position="'top'" :inline="true">
                    <FormItem :label="$t('OrderID')">
                        <Input v-model="orderID"
                                class="w-150 mr-30"
                                placeholder="1090000-AA123"/>
                    </FormItem>
                    <FormItem :label="$t('Progress')">
                        <Select v-model="progress"
                                class="w-150 mr-30"
                                :placeholder="$t('PlaceHolder.Select')">
                            <Option v-for="item in progressList"
                                    :value="item.value"
                                    :key="item.value">{{ item.label }}</Option>
                        </Select>
                    </FormItem>
                </Form>
                <Button class="btn btn--outline w-150 mr-30"
                        @click.stop="resetInput()">
                    {{$t('Reset')}}
                </Button>
                <Button class="btn w-150"
                        :disabled="!orderID || !progress || !outsoursingID"
                        @click.stop="getData()">
                        {{$t('Search')}}
                </Button>
            </div>
            <div class="info-bar">
                <template v-if="data && data.length > 0">
                    <div v-for="(item,index) in progressList"
                        class="progress-info"
                        :class="'progress-info--'+item.value"
                        :key="index">
                        {{ item.label }}
                    </div>
                    <div class="records">{{ $t('TotalCount',{count:data.length}) }}</div>
                </template>
            </div>
            <div class="item-container"
                 :class="{'item-container--border':data && data.length > 0}">
                <Spin v-if="apiLoading" fix />
                <div v-if="isNoData" class="no-data">
                    {{$t('NoData')}}
                </div>
                <div v-if="!outsoursingID" class="no-oursouring">
                    {{$t('Error.NotGetOutsourcing')}}
                </div>
                <div v-for="(item,index) in data"
                     class="items"
                     :class="'items--' + item.progress"
                     :key="index">
                    <div class="items__title">
                        {{ item.name }}
                    </div>
                    <div class="items__content">
                        {{ item.barcode }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ProgressCheck',
    data() {
        return {
            orderID: '',
            progress: '',
            outsoursingID: '',
            progressList: [
                { // 已接收
                    value: 'RC',
                    label: this.$t('Received')
                },
                { // 已轉檔
                    value: 'CO',
                    label: this.$t('Converted')
                },
                { // 已列卬
                    value: 'PR',
                    label: this.$t('Printed')
                },
                { // 已膠裝
                    value: 'BD',
                    label: this.$t('Binded')
                },
                { // 已檢驗
                    value: 'CK',
                    label: this.$t('Checked')
                },
                { // 已裝封
                    value: 'PA',
                    label: this.$t('Packaged')
                },
                { // 已交寄
                    value: 'PO',
                    label: this.$t('Posted')
                }
            ],
            data: [],
            isNoData: false,
            apiLoading: false
        }
    },
    created() {
        const { outsourcing = '' } = this.$store.state.profile || {}
        this.outsoursingID = outsourcing
    },
    methods: {
        getData() {
            if (!this.outsoursingID) return
            this.apiLoading = true
            const path = '/1/ins/c/data/progress/exclude/'
            const postObj = {
                outsourcing_id: this.outsoursingID,
                order_id: this.orderID,
                progress: this.progress
            }
            const config = {
                method: 'post',
                path: path,
                obj: postObj,
                success: this.setData,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataError(response) {
            var errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供工單編號
                    errMsg = this.$t('Error.GetSequence.Code1')
                    break
                case 2:
                    // 沒有提供排除進度
                    errMsg = this.$t('Error.GetSequence.Code2')
                    break
                case 3:
                    // 沒有提供委外編號
                    errMsg = this.$t('Error.GetSequence.Code3')
                    break
                default:
                    // 未預期的錯誤
                    errMsg = this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setData(response) {
            this.isNoData = false
            this.data = []
            if (!response.data || !response.data.data)
                return
            if (response.data.data.length === 0) {
                this.isNoData = true
                return
            }
            const data = this.deepCopy(response.data.data)
            data.sort(function(a, b) {
                if (a.progress > b.progress)
                    return 1
                if (a.progress < b.progress)
                    return -1
                return 0
            })
            this.data = data
        },
        resetInput() {
            this.progress = ''
            this.orderID = ''
        }
    }
}
</script>