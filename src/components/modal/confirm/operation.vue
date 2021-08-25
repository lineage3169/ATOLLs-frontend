<template>
    <Modal v-model="confirmModal"
            width="800px"
            :styles="{top: '30px'}"
            :closable="false">
        <h1 slot="header" class="fz--large">{{ titleNameMap[title] }}</h1>
        <div class="m-operation-confirm">
            <div class="info-area">
                <div v-for="(item, index) in info"
                    class="info-area__items"
                    :class="{'no-border':index == info.length - 1}"
                    :key="index">
                    <div class="info-area__items__title noselect">
                        {{item.item}}
                    </div>
                    <div class="info-area__items__content">
                        {{item.information}}
                    </div>
                </div>
            </div>
            <div class="info-area">
                <div v-if="title == 'ChangeAddress'" class="info-area__items no-border">
                    <div class="info-area__items__title">
                        {{ $t('Address') }}
                    </div>
                    <div class="info-area__items__content">
                        <div class="info-area__items__input--container">
                            <input  v-model="address"
                                    class="info-area__items__input"
                                    type="text"
                                    :placeholder="$t('PlaceHolder.PleaseEnter')+$t('New')+$t('Address')">
                        </div>
                    </div>
                </div>
                <div v-if="title != 'ChangeAddress'" class="info-area__items no-border">
                    <div class="info-area__items__title">
                        {{ $t('Reason') }}
                    </div>
                    <div class="info-area__items__content">
                        <div class="info-area__items__input--container">
                            <input  v-model="remarks"
                                    class="info-area__items__input"
                                    type="text"
                                    :placeholder="$t('PlaceHolder.PleaseEnter')+$t('Reason')">
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div slot="footer">
            <Button size="large"
                    class="btn btn--outline"
                    @click="confirmModal = false">
                {{ $t('Cancel') }}
            </Button>
            <Button size="large"
                    class="btn"
                    :loading="apiLoading"
                    :disabled="handleBtnDisable()"
                    @click="handleConfirm()" >
                {{ $t('Confirm') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'OperationConfirmModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        confirmInfo: {
            type: Object,
            required: true
        },
        title: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            confirmModal: false,
            columns: [
                {
                    title: this.$t('Item'),
                    key: 'item'
                },
                {
                    title: this.$t('Information'),
                    key: 'information'
                }
            ],
            info: [],
            statusNameMap: this.$store.state.statusNameMap,
            titleNameMap: {
                PickOut: this.$t('PickOutA'),
                Release: this.$t('ReleaseA'),
                CheckAndReject: this.$t('CheckAndReject'),
                ChangeAddress: this.$t('Change') + this.$t('Address')
            },
            titleToStatusMap: {
                PickOut: 'P',
                Release: 'N',
                CheckAndReject: 'CR',
                ChangeAddress: 'N'
            },
            insID: '',
            remarks: '',
            address: '',
            apiLoading: false
        }
    },
    methods: {
        handleConfirm() {
            this.apiLoading = true
            const postObj = {
                object_id: this.insID,
                status: this.titleToStatusMap[this.title],
                remarks: this.handleRemake()
            }
            const config = {
                method: 'post',
                path: '/1/ins/c/operation/create/',
                obj: postObj,
                success: this.handleConfirmSuccess,
                error: this.handleConfirmError,
                final: () => {
                    if (this.title !== 'ChangeAddress')
                        this.confirmModal = false
                    this.apiLoading = false
                }
            }
            this.ajax(config)
        },
        handleConfirmSuccess(response) {
            if (this.title === 'ChangeAddress') this.changeAddress()
            else {
                this.$Message.success('Success')
                this.$emit('refresh', 'searchForm')
            }
        },
        handleConfirmError(response) {
            var errMsg = this.$t('Error.OrderOperation.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 無效的狀態
                    errMsg += this.$t('Error.OrderOperation.Code1')
                    break
                case 2:
                    // 保單單號已被抽件
                    errMsg += this.$t('Error.OrderOperation.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleBtnDisable() {
            let verify = false
            if (this.title === 'ChangeAddress') {
                if (!this.address)
                    verify = true
            }
            return verify
        },
        handleRemake() {
            let str = ''
            if (this.title === 'ChangeAddress') str = '(變更地址) '
            else if (this.remarks) {
                switch (this.title) {
                case 'PickOut':
                    str = '(抽件) ' + this.remarks
                    break
                case 'Release':
                    str = '(放行) ' + this.remarks
                    break
                case 'CheckAndReject':
                    str = '(線上驗退) ' + this.remarks
                    break
                default:
                    break
                }
            }
            return str
        },
        changeAddress() {
            this.apiLoading = true
            const change = { update_address: this.address }
            const config = {
                method: 'post',
                path: '/1/ins/c/operation/update/',
                obj: {
                    object_id: this.insID,
                    changes: JSON.stringify(change)
                },
                success: () => {
                    this.$Message.success('Success')
                    this.$emit('refresh', 'searchForm')
                },
                error: this.changeAddressError,
                final: () => {
                    this.confirmModal = false
                    this.apiLoading = false
                }
            }
            this.ajax(config)
        },
        changeAddressError(response) {
            var errMsg = this.$t('Error.UpdateOperation.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 無效的值
                    errMsg += this.$t('Error.UpdateOperation.Code1')
                    break
                case 2:
                    // 保險單號不存在
                    errMsg += this.$t('Error.UpdateOperation.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        }
    },
    watch: {
        value(data) {
            this.confirmModal = data
        },
        confirmModal(data) {
            this.$emit('input', data)
            if (!data) {
                this.insID = ''
                this.remarks = ''
                this.address = ''
                this.info = []
            }
        },
        confirmInfo(val) {
            if (val) {
                this.insID = val.id
                let status = ''
                if (this.statusNameMap[val.status])
                    status = this.statusNameMap[val.status]
                else status = val.status
                this.info = [
                    { item: this.$t('InsPolicy&Form') + this.$t('NumberA'), information: val.name },
                    { item: this.$t('Batch') + this.$t('Date'), information: val.cycle_date },
                    { item: this.$t('Status'), information: status },
                    { item: this.$t('Barcode'), information: val.barcode },
                    { item: this.$t('Issuer'), information: this.$store.state.username }
                ]
            }
        }
    }
}
</script>