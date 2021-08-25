<template>
    <Modal v-model="show" width="360"
        :class="{ 'confirm--error' : error }">
        <div slot="header" class="fz--large">
            {{ $t('Confirm') }}
        </div>
        <div class="fz--primary txt-center" style="min-height: 80px;">
            {{ msg }}
        </div>
        <div slot="footer">
            <template v-if="error">
                <Button size="large"
                    type="error"
                    class="btn btn--error"
                    :loading="loading"
                    @click.stop="handleOk()">
                    {{ $t('Confirm') }}
                </Button>
                <Button size="large"
                        class="btn btn--outline"
                        @click.stop="show = false">
                        {{ $t('Cancel') }}
                </Button>
            </template>
            <template v-else>
                <Button size="large"
                        class="btn btn--outline"
                        @click.stop="show = false">
                        {{ $t('Cancel') }}
                </Button>
                <Button size="large"
                    type="error"
                    class="btn"
                    :loading="loading"
                    @click.stop="handleOk()">
                    {{ $t('Confirm') }}
                </Button>
            </template>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'ConfirmModal',
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
        error: {
            type: Boolean,
            default: false
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