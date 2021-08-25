<template>
    <div class="menu-item noselect" @click.stop="emitClick">
        <div class="menu-item__icon">
            <Icon v-if="icon" :type="icon" />
        </div>
        <div class="menu-item__label">{{label}}</div>
        <slot></slot>
    </div>
</template>
<script>
export default {
    name: 'MenuItem',
    props: {
        label: {
            type: String
        },
        icon: {
            type: String
        }
    },
    methods: {
        emitClick() {
            this.$emit('click')
        }
    }
}
</script>