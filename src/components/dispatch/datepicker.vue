<template>
    <div :ref="'datepicker'" class="c-datepicker noselect">
        <input  v-if="!ifSlot"
                v-model="output"
                class="datepicker__input ivu-input ivu-input-default"
                readonly
                :placeholder="$t('PlaceHolder.SelectDate')"
                @focus="show($event)"/>
        <slot></slot>
        <div v-if="datePickerShow"
            class="dates-container"
            :style="`left:${posX}px;top:${posY}px;`"
            @click.stop="" >
            <div v-for="(item, index) in date"
                class="dates-item"
                :class="{'dates-item--active':item.active,
                         'dates-item--disable':item.disable,
                         'dates-item--isMultiSelect':isMultiSelect}"
                :key="index"
                @click.stop="selectDate(index)">
                {{item.value}}
            </div>
            <div class="btn-conatiner d-flex d-flex--justify-end mt-20">
                <Button class="btn btn--outline mr-5"
                        @click.stop="resetData()">
                        {{$t('Reset')}}
                </Button>
                <Button class="btn btn--outline mr-5"
                        @click.stop="selectAllData()">
                        {{$t('SelectAll')}}
                </Button>
                <Button class="btn"
                        :disabled="disableSave()"
                        @click.stop="onOK()">
                        {{$t('OK')}}
                </Button>
            </div>
        </div>
        <div v-if="datePickerShow == true && !ifSlot"
            class="datepicker__wrap"
            @click.stop="close()"
            @contextmenu.stop="onOK()"/>
    </div>
</template>
<script>
export default {
    name: 'DatePicker',
    props: {
        value: {
            type: Array
        },
        open: {
            type: Boolean,
            default: null
        },
        disabledDate: {
            type: Array
        }
    },
    data() {
        return {
            date: [],
            posX: 0,
            posY: 0,
            outputData: [],
            ifSlot: this.$slots.default,
            datePickerShow: false,
            isMultiSelect: false
        }
    },
    created() {
        this.setDates()
    },
    methods: {
        setDates() {
            for (let i = 1; i < 32; i++) {
                const obj = {
                    value: i,
                    active: false,
                    disable: false
                }
                this.date.push(obj)
            }
        },
        setData() {
            const arr = this.date
                .filter(item => item.active === true)
                .map(item => item.value)
            this.outputData = arr
        },
        selectDate(index) {
            if (!this.date[index].disable) {
                this.date[index].active = !this.date[index].active
                this.setData()
            }
        },
        disableSave() {
            const arr = this.date.filter(item => item.active === true)
            if (arr.length === 0)
                return true
            return false
        },
        resetData() {
            this.date.forEach(element => { element.active = false })
            this.outputData = []
        },
        setPos(posX, posY) {
            this.posX = posX
            this.posY = posY
        },
        onOK() {
            this.$emit('on-ok')
            this.close()
        },
        close() {
            this.datePickerShow = false
        },
        show() {
            const el = this.$refs.datepicker.getBoundingClientRect()
            const body = document.body.getBoundingClientRect()
            const datepickerWidth = 245
            let posX = 0
            let posY = 0
            if (!this.ifSlot) {
                posX = el.left
                posY = el.bottom + 5
            }
            else {
                posX = el.right + 20
                posY = el.top - 120
            }
            if (el.right + datepickerWidth > body.width)
                posX = el.left - 250
            this.setPos(posX, posY)
            this.datePickerShow = true
        },
        selectAllData() {
            this.date.forEach(item => {
                if (!item.disable) item.active = true
            })
            this.setData()
        }
    },
    watch: {
        value(data) {
            this.outputData = data
            this.date.forEach(item => { item.active = false })
            this.outputData.forEach(i => { this.date[i - 1].active = true })
        },
        outputData(data) {
            this.$emit('input', data)
        },
        open(data) {
            this.datePickerShow = data
            if (data) this.show()
        },
        disabledDate(data) {
            this.date.forEach(el => { el.disable = false })
            data.forEach(el => {
                const index = parseInt(el) - 1
                if (!isNaN(index))
                    this.date[index].disable = true
            })
            if (data && data.length > 0)
                this.isMultiSelect = true
            else this.isMultiSelect = false
        }
    },
    computed: {
        output() {
            return this.outputData.join(' , ')
        }
    }
}
</script>