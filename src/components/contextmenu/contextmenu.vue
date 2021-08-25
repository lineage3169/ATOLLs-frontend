<template>
    <div v-show="contextmenuShow" class="c-contextmenu">
        <div  class="contextmenu"
              :style="`left:${posX}px;top:${posY}px;`"
              @click.stop="">
            <slot></slot>
        </div>
        <div class="contextmenu__wrap"
             @contextmenu.stop="closeContextmenu($event)"
             @click.stop="contextmenuShow = false"/>
    </div>
</template>
<script>
export default {
    name: 'Contextmenu',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            posX: 0,
            posY: 0,
            contextmenuShow: false
        }
    },
    methods: {
        setPos(posX, posY) {
            this.posX = posX
            this.posY = posY
        },
        closeContextmenu(e) {
            this.contextmenuShow = false
            e.preventDefault()
        }
    },
    watch: {
        value(data) {
            this.contextmenuShow = data
        },
        contextmenuShow(data) {
            this.$emit('input', data)
        }
    }
}
</script>