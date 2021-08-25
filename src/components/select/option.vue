<template>
    <li @click.stop="emitClick">
        <slot></slot>
    </li>
</template>
<script>
export default {
    name: 'options',
    props: {
        value: {
            default: null
        },
        label: {
            type: String,
            default: null
        }
    },
    methods: {
        emitClick() {
            if (this.$parent && this.$parent.setData) {
                const obj = { value: '', label: '' }
                obj.value = this.value
                obj.label = this.label
                this.$parent.setData(obj)
            }
        }
    }
}
</script>