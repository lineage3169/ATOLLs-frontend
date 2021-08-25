<template>
    <div class="c-colorpicker" @click.stop="">
        <div v-for="(item, index) in colors"
            class="color__item"
            :key="index">
            <Tooltip placement="top" :content="item.label" :delay="500">
                <span :style="`background-color:${item.code};`"
                      @click.stop="selectColor(item)">
                    <Icon v-if="item.active" type="ios-checkmark" />
                </span>
            </Tooltip>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ColorPicker',
    props: {
        selectEvent: {
            type: Array
        }
    },
    data() {
        return {
            colors: [
                {
                    label: '番茄紅',
                    code: '#D50000',
                    active: false
                },
                {
                    label: '紅鶴色',
                    code: '#E67C73',
                    active: false
                },
                {
                    label: '橙橘色',
                    code: '#F4511E',
                    active: false
                },
                {
                    label: '香蕉黃',
                    code: '#F6BF26',
                    active: false
                },
                {
                    label: '鼠尾草綠',
                    code: '#33B679',
                    active: false
                },
                {
                    label: '羅勒綠',
                    code: '#0B8043',
                    active: false
                },
                {
                    label: '海藍色',
                    code: '#0D8EA8',
                    active: true
                },
                {
                    label: '孔雀藍',
                    code: '#039BE5',
                    active: false
                },
                {
                    label: '藍梅色',
                    code: '#3F51B5',
                    active: false
                },
                {
                    label: '薰衣草色',
                    code: '#7986CB',
                    active: false
                },
                {
                    label: '葡萄紫',
                    code: '#8E24AA',
                    active: false
                },
                {
                    label: '石墨黑',
                    code: '#616161',
                    active: false
                }
            ]
        }
    },
    methods: {
        setActiveColor(colorCode) {
            this.colors.forEach(el => {
                el.active = false
                if (el.code === colorCode)
                    el.active = true
            })
        },
        selectColor(item) {
            this.colors.forEach(el => { el.active = false })
            item.active = true
            if (item.code && this.selectEvent)
                this.$emit('on-change', item.code)
        }
    },
    watch: {
        selectEvent(data) {
            if (data && data.length > 0) {
                if (data[0].meta && data[0].meta.color)
                    this.setActiveColor(data[0].meta.color)
            }
        }
    }
}
</script>