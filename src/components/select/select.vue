<template>
    <div ref="c-select" class="c-select">
        <input  class="ivu-input ivu-input-default"
                type="text"
                readonly
                v-model="selectData.label"
                :ref="'input'"
                :placeholder="placeholder"
                @focus="optionShow = true">
        <Icon class="down-arrow" type="ios-arrow-down" />
        <div v-show="optionShow" class="selcet-container" :style="`max-height:${maxHeight}px;`">
            <ul>
                <slot ></slot>
            </ul>
        </div>
        <div v-show="optionShow" class="selcet__wrap" @click="optionShow = false"></div>
    </div>
</template>
<script>
export default {
    name: 'Select',
    props: {
        value: {
            default: null
        },
        placeholder: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            optionShow: false,
            selectData: {
                value: '',
                label: ''
            },
            posX: 0,
            posY: 0,
            width: 100,
            maxHeight: 150
        }
    },
    methods: {
        setData(data) {
            this.selectData = data
            this.optionShow = false
        }
    },
    watch: {
        value(data) {
            this.selectData.value = data
            if (!data) this.selectData.label = ''
        },
        'selectData.value': function(data) {
            this.$emit('input', data)
        },
        optionShow(data) {
            this.maxHeight = 200
            if (data) {
                const el = this.$refs.input.getBoundingClientRect()
                const body = document.body.getBoundingClientRect()
                this.maxHeight = body.bottom - el.bottom - 30
            }
        }
    }
}
</script>