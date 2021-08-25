<template>
    <div class="p-dispatch mt-15">
        <Spin v-if="apiLoading" size="large" fix/>
        <table class="calendar noselect">
            <thead></thead>
            <tr v-for="(rowItem, index) in row" :key="index">
                <td class="calendar__items"
                    v-for="(colItem, index) in col" :key="index"
                    :class="{'no-border--right':isLastCol(colItem)}"
                    @click.stop="openEventAdd(dateNumber(colItem,rowItem));closeContextmenu()"
                    @contextmenu.stop="closeContextmenu()">
                    <template v-if="dateNumber(colItem,rowItem) < 32">
                        <div class="calendar__items__days">{{dateNumber(colItem,rowItem)}}</div>
                        <div class="calendar__items__events">
                            <ul v-if="events && events.length > 0">
                                <template v-for="(item, index) in events[eventsIndex(colItem,rowItem)].events" >
                                    <li v-if="index < 3"
                                        class="calendar__events"
                                        :style="getEventColor(item)"
                                        :key="index"
                                        @click.stop="handleEventInfo(item)"
                                        @contextmenu.stop="openContextmenu($event,item)">
                                        {{item.project.name +'->' + item.outsourcing.name }}
                                    </li>
                                </template>
                            </ul>
                        </div>
                        <div  class="calendar__items__more">
                            <template v-if="events && events.length > 0">
                              <span v-if="events[eventsIndex(colItem,rowItem)].events.length > 3"
                                    @click.stop="openEventMore(eventsIndex(colItem,rowItem))">
                                  {{`+${moreNumber(eventsIndex(colItem,rowItem))} more`}}
                              </span>
                            </template>
                        </div>
                    </template>
                </td>
            </tr>
        </table>
        <!-- 新增事件 -->
        <EventAdd  v-model="EventAddShow"
                    :date="selectDate"
                    :events-pool="eventsPool"
                    @on-saved="getData"/>
        <!-- 右鍵選單 -->
        <Contextmenu ref="contextmenu" v-model="contextmenuShow">
            <MenuItem >
                <DispatchDatepicker ref="datepicker"
                                    v-model="removeEventsDate"
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
        <!-- 更多 -->
        <EventMore  v-model="eventMoreShow"
                    ref="eventMore"
                    :event="selectDayEvents"
                    :events-pool="eventsPool"/>
        <!-- 事件資訊 -->
        <EventModal v-model="eventModalShow" :event-info="eventInfoArr"/>
    </div>
</template>

<script>
import EventModal from '@/components/dispatch/event-modal.vue'
import EventAdd from '@/components/dispatch/event-add.vue'
import EventMore from '@/components/dispatch/event-more.vue'
import DispatchColorpicker from '@/components/dispatch/colorpicker.vue'
import DispatchDatepicker from '@/components/dispatch/datepicker.vue'
export default {
    name: 'Dispatch',
    components: {
        EventModal,
        EventAdd,
        EventMore,
        DispatchColorpicker,
        DispatchDatepicker,
        Contextmenu: resolve => require(['@/components/contextmenu/contextmenu.vue'], resolve),
        MenuItem: resolve => require(['@/components/contextmenu/menu-item.vue'], resolve)
    },
    data() {
        return {
            row: [0, 1, 2, 3, 4],
            col: [1, 2, 3, 4, 5, 6, 7],
            selectEvent: null,
            selectDayEvents: null,
            selectDate: 1,
            disableDate: [],
            removeEventsDate: [],
            eventsPool: [],
            events: [],
            eventInfoArr: [],
            apiLoading: false,
            // components show
            EventAddShow: false,
            contextmenuShow: false,
            datePickerShow: false,
            eventMoreShow: false,
            eventModalShow: false
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.events = []
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/ins/c/order/calendar/get/',
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (response.data.data && response.data.data.length > 0) {
                this.eventsPool = response.data.data
                this.setEvent()
            }
        },
        getDataError(response) {
            let errMsg = this.$t('Error.OrderCalendar.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        getEventColor(item) {
            if (!item) return
            if (item.meta && item.meta.color && item.meta.color.length === 7)
                return `background-color: ${item.meta.color};`
        },
        getRelatedEvent() {
            if (!this.selectEvent) return
            const oID = this.selectEvent.outsourcing.id
            const pID = this.selectEvent.project.id
            let arr = []
            arr = this.eventsPool.filter(item => {
                return item.outsourcing.id === oID && item.project.id === pID
            })
            return arr
        },
        setEvent() {
            const data = this.deepCopy(this.eventsPool)
            for (let i = 1; i < 32; i++) {
                const obj = {
                    day: i,
                    events: []
                }
                this.events.push(obj)
            }
            data.sort((a, b) => {
                if (a.create_time < b.create_time) return -1
                if (a.create_time > b.create_time) return 1
                return 0
            })
            data.sort((a, b) => {
                if (a.priority < b.priority) return -1
                if (a.priority > b.priority) return 1
                return 0
            })
            const events = this.deepCopy(this.events)
            data.reduce((acc, crr) => {
                const index = crr.day - 1
                if (!isNaN(index) && index >= 0)
                    acc[index].events.push(crr)
                return acc
            }, events)
            this.events = events
        },
        setEventColor(code) {
            if (!code) return
            const config = {
                method: 'post',
                path: '/1/ins/c/order/calendar/meta/update/',
                obj: { data: this.transToPostEventColor(code) },
                success: this.setEventColorSuccess,
                error: this.setEventColorError
            }
            this.ajax(config)
        },
        setEventColorSuccess() {
            this.getData()
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
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        eventsIndex(col, row) {
            return col + (row * 7) - 1
        },
        isLastCol(col) {
            const lastColIndex = this.col.length - 1
            if (col === this.col[lastColIndex]) return true
            else return false
        },
        dateNumber(col, row) {
            return col + (row * 7)
        },
        openEventAdd(dateNum) {
            if (dateNum < 32) {
                this.selectDate = dateNum
                this.EventAddShow = true
            }
        },
        openEventMore(index) {
            const elements = document.getElementsByClassName('calendar__items')
            const el = elements[index].getBoundingClientRect()
            this.selectDayEvents = this.events[index]
            this.$refs.eventMore.setPos(el)
            this.eventMoreShow = true
        },
        openContextmenu(e, item) {
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
        closeContextmenu() {
            this.contextmenuShow = false
            this.selectEvent = null
        },
        moreNumber(index) {
            const len = this.events[index].events.length
            return len - 3
        },
        filterOrders() {
            this.disableDate = []
            const disableDate = []
            let arr = []
            arr = this.getRelatedEvent()
            arr = arr.map(item => item.day)
            for (let i = 1; i < 32; i++)
                if (arr.indexOf(i) === -1) disableDate.push(i)

            this.disableDate = disableDate
        },
        handleDateicker() {
            this.datePickerShow = !this.datePickerShow
        },
        handleEventInfo(item) {
            this.selectEvent = item
            this.eventInfoArr = this.getRelatedEvent()
            this.eventModalShow = true
        },
        deleteEvents() {
            let arr = this.getRelatedEvent()
            arr = arr
                .filter(item => this.removeEventsDate.indexOf(item.day) >= 0)
                .map(item => item.id)
            const config = {
                method: 'post',
                path: '/1/ins/c/order/calendar/delete/',
                obj: { data: this.transToPost(arr) },
                params: arr,
                success: this.deleteEventsSuccess,
                error: this.deleteEventsError
            }
            this.ajax(config)
        },
        deleteEventsSuccess(response, arr) {
            this.$Message.success(this.$t('Delete') + this.$t('Success'))
            this.eventsPool = this.eventsPool
                .filter(item => arr.indexOf(item.id) === -1)
            this.events = []
            this.setEvent()
            this.closeContextmenu()
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
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        transToPost(input) {
            const data = this.deepCopy(input)
            const obj = {}
            obj.id_list = data
            return JSON.stringify(obj)
        },
        transToPostEventColor(code) {
            const obj = {}
            obj.metadata = {}
            let arr = []
            arr = this.getRelatedEvent()
            arr.forEach(item => { obj.metadata[item.id] = { color: code } })
            return JSON.stringify(obj)
        }
    }
}
</script>