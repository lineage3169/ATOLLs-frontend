<template>
    <Modal v-model="modalShow" width="450">
        <div slot="header" class="fz--large">
            {{ actionText() }}
        </div>
        <div class="confirm-body">
            <Table border
                    :columns="columns"
                    :data="tableData"
                    :no-data-text="$t('NoData')"/>
            <p class="mt-30 mb-5">{{ $t('OrderCode') }}</p>
            <input v-model="orderCode"
                    class="ivu-input ivu-input-default mb-5"
                    :placeholder="$t('PlaceHolder.PleaseTypeOrderCode')"
                    @paste.prevent/>
            <span v-if="action === 'DEACTIVATE' && orderCode"
                    class="mb-30"
                    style="color: #e24e4e;font-size: 12px;">
                {{`${$t('Modal.DeactivateConfirm')} "${orderCode}" ?`}}
            </span>
        </div>
        <div slot="footer">
            <Button v-if="action === 'DEACTIVATE'"
                    size="large"
                    class="btn btn--error w-100"
                    :loading="apiLoading"
                    :disabled="!orderCode"
                    @click.stop="submit()">
                    {{ actionText() }}
            </Button>
            <Button size="large"
                    class="btn btn--outline w-100"
                    :loading="apiLoading"
                    @click.stop="modalShow = false">
                    {{$t('Cancel')}}
            </Button>
            <Button v-if="action === 'APPROVE'"
                    size="large"
                    class="btn w-100"
                    :loading="apiLoading"
                    :disabled="!orderCode"
                    @click.stop="submit()">
                    {{ actionText() }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'OrderCodeConfirm',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        data: {
            type: Object
        },
        action: {
            type: String,
            default: 'APPROVE'
        }
    },
    data() {
        return {
            orderID: '',
            orderCode: '',
            milestone: '',
            modalShow: false,
            actionType: null,
            apiLoading: false,
            tableData: [],
            columns: [
                {
                    title: this.$t('Order') + this.$t('ID'),
                    key: 'order_id'
                },
                {
                    title: this.$t('Milestone'),
                    key: 'mile_stone'
                }
            ]
        }
    },
    methods: {
        submit() {
            if (this.action === 'APPROVE') this.approve()
            if (this.action === 'DEACTIVATE') this.deactivate()
        },
        approve() {
            if (!this.orderID || !this.orderCode) return
            this.apiLoading = true
            const config = {
                method: 'post',
                obj: {
                    order_id: this.orderID,
                    order_code: this.orderCode
                },
                path: '/1/ins/c/order/code/approval/update/',
                success: this.approveSuccess,
                error: this.handleActionError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        approveSuccess() {
            const successMsg = this.$t('Approve') + this.$t('Success')
            this.$Message.success(successMsg)
            this.$emit('reflash')
            this.resetData()
            this.modalShow = false
        },
        deactivate() {
            if (!this.orderID || !this.orderCode) return
            this.apiLoading = true
            const config = {
                method: 'post',
                obj: {
                    order_id: this.orderID,
                    order_code: this.orderCode
                },
                path: '/1/ins/c/order/code/deactive/',
                success: () => {
                    this.$emit('deactivateSuccess', this.key)
                    this.resetData()
                },
                error: this.handleActionError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        handleActionError(response) {
            let errMsg = this.$t('Error.OrderCodeAction.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 確認碼不存在
                    errMsg += this.$t('Error.OrderCodeAction.Code1')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        resetData() {
            this.orderCode = ''
            this.orderID = ''
            this.milestone = ''
            this.tableData = []
        },
        actionText() {
            if (this.action === 'APPROVE') return this.$t('Approve')
            if (this.action === 'DEACTIVATE') return this.$t('Deactivate')
        }
    },
    watch: {
        value(data) {
            this.modalShow = data
        },
        modalShow(data) {
            this.$emit('input', data)
        },
        data(data) {
            this.resetData()
            const propsData = this.deepCopy(data)
            this.orderID = propsData.order_id
            this.milestone = propsData.mile_stone
            this.tableData = [propsData]
        }
    },
    computed: {
        key() {
            return `${this.orderCode}-${this.orderID}-${this.milestone}`
        }
    }
}
</script>