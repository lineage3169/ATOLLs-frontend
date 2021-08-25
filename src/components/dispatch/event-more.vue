<template>
    <div v-if="eventMoreShow"
        class="m-event-more noselect"
        @click.stop="close()">
        <div class="event-more" :style="`left:${posX}px;top:${posY}px;`" @click.stop="">
            <div class="close">
                <Icon type="md-close" @click.stop="close()"/>
            </div>
            <div class="event-more__title mb-10">
                {{setTitle()}}
            </div>
            <ul>
                <li v-for="(item, index) in items"
                    class="event-more__item"
                    :key="index"
                    :style="`width:${width}px;${getEventColor(item)}`"
                    @click.stop="handleEventInfo(item)"
                    @contextmenu.stop="showContextmenu($event,item)">
                    {{`${item.project.name} -> ${item.outsourcing.name} `}}
                </li>
            </ul>
        </div>
        <!-- 右鍵選單 -->
        <Contextmenu v-model="contextmenuShow" ref="contextmenu">
            <MenuItem >
                <DispatchDatepicker v-model="removeEventsDate"
                                    ref="datepicker"
                                    :open="datePickerShow"
                                    :disabled-date="disableDate"
                                    @on-ok="deleteEvents()">
                    <MenuItem :label="$t('Delete')" :icon="'md-trash'" @click="handleDateicker()"/>
                </DispatchDatepicker>
            </MenuItem>
            <MenuItem >
                <DispatchColorpicker ref="colorpicker"
                                    :select-event="getRelatedEvent()"
                                    @on-change="setEventColor"/>
            </MenuItem>
        </Contextmenu>
        <!-- 事件資訊 -->
        <EventModal v-model="eventModalShow" :event-info="eventInfoArr"/>
    </div>
</template>
<script>
import EventModal from '@/components/dispatch/event-modal.vue'
import DispatchDatepicker from '@/components/dispatch/datepicker.vue'
import DispatchColorpicker from '@/components/dispatch/colorpicker.vue'
export default {
    name: 'EventMore',
    components: {
        EventModal,
        DispatchDatepicker,
        DispatchColorpicker,
        Contextmenu: resolve => require(['@/components/contextmenu/contextmenu.vue'], resolve),
        MenuItem: resolve => require(['@/components/contextmenu/menu-item.vue'], resolve)
    },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        event: {
            type: Object,
            default: null
        },
        eventsPool: {
            type: Array
        }
    },
    data() {
        return {
            posX: 0,
            posY: 0,
            width: 180,
            removeEventsDate: [],
            disableDate: [],
            items: [],
            deleteEventsId: [],
            eventInfoArr: [],
            selectEvent: null,
            // components show
            eventMoreShow: false,
            contextmenuShow: false,
            datePickerShow: false,
            eventModalShow: false
        }
    },
    methods: {
        getEventColor(item) {
            if (!item)
                return
            if (item?.meta?.color && item.meta.color.length === 7)
                return `background-color: ${item.meta.color};`
        },
        getRelatedEvent() {
            if (!this.selectEvent)
                return
            const oID = this.selectEvent.outsourcing.id
            const pID = this.selectEvent.project.id
            let arr = []
            arr = this.eventsPool.filter(item => {
                return item.outsourcing.id === oID && item.project.id === pID
            })
            return arr
        },
        setTitle() {
            const d = this.event.day || 1
            return `Day ${d}`
        },
        setEventColor(code) {
            if (!code) return
            const config = {
                method: 'post',
                path: '/1/ins/c/order/calendar/meta/update/',
                obj: { data: this.transToPostEventColor(code) },
                params: code,
                success: this.setEventColorSuccess,
                error: this.setEventColorError
            }
            this.ajax(config)
        },
        setEventColorSuccess(response, code) {
            this.$parent.getData()
            this.items = this.items.map(item => {
                if (item.id === this.selectEvent.id) {
                    if (!item.meta) item.meta = {}
                    item.meta.color = code
                }
                return item
            })
        },
        setEventColorError(response) {
            let errMsg = this.$t('Error.OrderCalendarUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 未提供 Meta 資料
                    errMsg += this.$t('Error.OrderCalendarUpdate.Code1')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        setPos(el) {
            if (!el) return
            this.width = el.width
            this.posX = el.left - 15
            this.posY = el.top - 45
        },
        close() {
            this.eventMoreShow = false
        },
        handleDateicker() {
            this.datePickerShow = !this.datePickerShow
        },
        showContextmenu(e, item) {
            const body = document.body.getBoundingClientRect()
            const contextmenuWidth = 182
            let x = e.clientX
            const y = e.clientY
            if (e.clientX + contextmenuWidth > body.width)
                x = e.clientX - contextmenuWidth
            this.$refs.contextmenu.setPos(x, y)
            this.removeEventsDate = []
            if (item) {
                this.selectEvent = item
                this.filterOrders()
                this.removeEventsDate.push(item.day)
            }
            this.contextmenuShow = true
            this.datePickerShow = false
            e.preventDefault()
        },
        filterOrders() {
            this.disableDate = []
            const disableDate = []
            let arr = []
            arr = this.getRelatedEvent()
            arr = arr.map(item => item.day)

            for (let i = 1; i < 32; i++) {
                if (arr.indexOf(i) === -1)
                    disableDate.push(i)
            }
            this.disableDate = disableDate
        },
        transToPost(input) {
            const data = this.deepCopy(input)
            const obj = {}
            obj.id_list = data
            return JSON.stringify(obj)
        },
        transToPostEventColor(code) {
            const obj = this.getRelatedEvent()
                .reduce((acc, crr) => {
                    acc.metadata[crr.id] = { color: code }
                    return acc
                }, { metadata: {} })
            return JSON.stringify(obj)
        },
        deleteEvents() {
            let arr = this.getRelatedEvent()
            arr = arr.filter(item => this.removeEventsDate.indexOf(item.day) >= 0)
                .map(item => item.id)
            const config = {
                method: 'post',
                path: '/1/ins/c/order/calendar/delete/',
                obj: { data: this.transToPost(arr) },
                success: this.deleteEventsSuccess,
                error: this.deleteEventsError
            }
            this.ajax(config)
        },
        deleteEventsSuccess(response) {
            this.$Message.success(this.$t('Delete') + this.$t('Success'))
            this.$parent.getData()
            this.contextmenuShow = false
            this.eventMoreShow = false
        },
        deleteEventsError(response) {
            let errMsg = this.$t('Error.OrderCalendarDelete.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 未提供UUID
                    errMsg += this.$t('Error.OrderCalendarDelete.Code1')
                    break
                case 2:
                    // 錯誤的UUID格式
                    errMsg += this.$t('Error.OrderCalendarDelete.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleEventInfo(item) {
            this.selectEvent = item
            this.eventInfoArr = this.getRelatedEvent()
            this.eventModalShow = true
        }
    },
    watch: {
        value(data) {
            this.eventMoreShow = data
        },
        eventMoreShow(data) {
            this.$emit('input', data)
        },
        event(data) {
            if (data) this.items = data.events
        }
    }
}
</script>