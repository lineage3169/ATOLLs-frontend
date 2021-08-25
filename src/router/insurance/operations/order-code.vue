<template>
    <div class="p-order-code">
        <div class="table noselect">
            <Table :columns="columns"
                    :data="data"
                    :no-data-text="$t('NoData')" />
        </div>
        <OrderCodeConfirm v-model="modalShow"
                            :data="selectData"
                            :action="confirmType"
                            @reflash="getData"
                            @deactivateSuccess="deactivateSuccess"/>
    </div>
</template>
<script>
import OrderCodeConfirm from '@/components/dispatch/order-code-confirm.vue'
import columns from './columns/order-code'
export default {
    name: 'OrderCode',
    components: {
        OrderCodeConfirm
    },
    data() {
        return {
            data: [],
            selectData: null,
            confirmType: 'APPROVE',
            modalShow: false,
            columns: columns(this)
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.data = []
            const config = {
                method: 'get',
                path: '/1/ins/c/order/code/list/get/',
                success: response => {
                    if (response.data && response.data.data)
                        this.data = response.data.data
                },
                error: this.getDataError
            }
            this.ajax(config)
        },
        getDataError(response) {
            let errMsg = this.$t('Error.OrderCode.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        confirm(data, action) {
            this.confirmType = action
            this.selectData = data
            this.modalShow = true
        },
        deactivateSuccess(keyString) {
            const successMsg = this.$t('Deactivate') + this.$t('Success')
            this.$Message.success(successMsg)
            this.data = this.data
                .filter(item => {
                    const key = `${item.code}-${item.order_id}-${item.mile_stone}`
                    return key !== keyString
                })
            this.modalShow = false
        }
    }
}
</script>