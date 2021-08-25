<template>
    <Modal v-model="show" width="360">
        <div slot="header" class="fz--large">
            {{`${$t('Delete')}${$t('Confirm')}`}}
        </div>
        <div class="txt-center fz--primary" style="min-height: 80px;">
            {{`${$t('Modal.DeleteConfirm')} "${msg}" ?`}}
        </div>
        <div slot="footer">
            <Button size="large"
                    type="error"
                    class="btn btn--error"
                    :loading="loading"
                    @click.stop="handleOk()">
                    {{ $t('Delete') }}
            </Button>
            <Button size="large"
                    class="btn btn--outline"
                    @click.stop="show = false">
                    {{ $t('Cancel') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'DeleteConfirmModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        loading: {
            type: Boolean,
            default: false
        },
        msg: {
            type: String,
            default: ''
        },
        onOk: {
            type: Function
        }
    },
    data() {
        return {
            show: false
        }
    },
    methods: {
        handleOk() {
            if (this.onOk && typeof this.onOk === 'function')
                this.onOk()
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            this.$emit('input', data)
        }
    }
}
</script>