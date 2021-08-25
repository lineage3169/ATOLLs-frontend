<template>
    <div class="working-day">
        <div class="header noselect">
            <div class="header__info">
                <div class="header__info__item header__info__item--holiday mr-15">
                    {{$t('Holiday')}}
                </div>
                <div class="header__info__item header__info__item--workday mr-15">
                    {{$t('WorkingDay')}}
                </div>
                <div class="header__info__item header__info__item--current-month">
                    {{$t('CurrentMonth')}}
                </div>
            </div>
            <div class="header__btns">
                <Poptip v-if="this.$i18n.locale === 'zh_tw'"
                        trigger="hover">
                    <Icon class="icon" type="md-help-circle" />
                    <div slot="title">
                        行政機關辦公日曆表 <span style="color:red;">(本系統上傳格式)</span>
                    </div>
                    <div slot="content">
                        <a href="https://data.gov.tw/dataset/14718" target="_blank">
                            1. 匯入檔下載連結
                        </a>
                        <ul>
                            <li>2. 選擇預匯入年份之辦公日曆表<span style="color:red;">(非Google行事曆專用)</span></li>
                            <li>3. 點選檢視資料</li>
                            <li>4. 點選JSON下載</li>
                        </ul>
                    </div>
                </Poptip>
                <Upload v-if="this.$i18n.locale === 'zh_tw'"
                        :action="'//jsonplaceholder.typicode.com/posts'"
                        :accept="'.json'"
                        :show-upload-list="false"
                        :before-upload="uploadChange">
                    <Button class="btn w-150 mr-10 fz--primary"
                            icon="md-cloud-upload">
                            匯入行事曆
                    </Button>
                </Upload>
                <Button class="btn btn--outline w-150 mr-10 fz--primary"
                        @click.stop="reset()">
                        {{$t('RemoveA') + $t('ALL')}}
                    </Button>
                <Button class="btn w-150 fz--primary mr-10"
                        :loading="saveLoading"
                        @click="saveData()">
                        {{$t('Save')}}
                </Button>
            </div>
        </div>
        <div class="calendar noselect">
            <Spin v-if="apiLoading" size="large" fix/>
            <div v-for="(item, monthIndex) in month"
                class="calendar__item"
                :key="monthIndex"
                :class="{'current-month':item.current,
                        'calendar--next-year':item.value <= currentMonth}">
                <div class="month">
                    {{`${item.month} - `}}
                    <b>{{item.year}}</b>
                </div>
                <div class="week">
                    <div v-for="(item, index) in weeks"
                        class="week__item"
                        :class="{'calendar__item--holiday':item === 6 || item === 7}"
                        :key="index">
                        {{$t(`Weeks.${item}`)}}
                    </div>
                </div>
                <div class="days">
                        <div v-for="(daysItem, daysIndex) in days[monthIndex]"
                            class="days__item"
                            :key="daysIndex"
                            :class="{'calendar__item--holiday':daysItem.nationalHoliday,
                                    'days__item--holiday':daysItem.status === 'holiday',
                                    'days__item--working-day':daysItem.status === 'workingday',
                                    'no-border': !daysItem.value,
                                    'avoid-clicks':!daysItem.value}"
                            @click="changeStatus(daysItem)">
                            {{daysItem.label}}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'WorkingDay',
    data() {
        return {
            currentYear: '',
            currentMonth: 0,
            month: [],
            days: [],
            weeks: [1, 2, 3, 4, 5, 6, 7],
            importArr: [],
            // loading
            apiLoading: false,
            saveLoading: false
        }
    },
    created() {
        const d = new Date()
        this.currentYear = d.getFullYear()
        this.currentMonth = d.getMonth()
        this.setMonth()
        this.getData()
    },
    methods: {
        getData() {
            this.apiLoading = true
            this.reset()
            const config = {
                method: 'get',
                path: '/1/sys/c/env/parameter/all/get/',
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (response && response.data.data) {
                const data = response.data.data
                let holiday = []
                let workingDay = []
                const holidayIndex = data.findIndex(item => item.key === 'NATIONAL_HOLIDAY')
                const workingDayIndex = data.findIndex(item => item.key === 'WORK_ON_WEEKENDS')
                if (holidayIndex > -1) {
                    if (data[holidayIndex].values)
                        holiday = data[holidayIndex].values.split(',')
                    this.setData(holiday, 'holiday')
                }
                if (workingDayIndex > -1) {
                    if (data[workingDayIndex].values)
                        workingDay = data[workingDayIndex].values.split(',')
                    this.setData(workingDay, 'workingday')
                }
            }
        },
        getDataError(response) {
            let errMsg = this.$t('Error.WorkingDay.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setData(data, status = '') {
            data.forEach(item => {
                const month = +item.slice(0, 2) - 1
                const index = this.days[month]
                    .findIndex(dayItem => dayItem.value === item)
                if (index > -1 && status)
                    this.days[month][index].status = status
            })
        },
        setMonth() {
            for (let i = 0; i < 12; i++) {
                let year = this.currentYear
                if (i < this.currentMonth) year += 1
                const monthText = `${this.$t('Month.' + i)}`
                const obj = {
                    month: monthText,
                    year: year,
                    value: i + 1,
                    current: false
                }
                if (i === this.currentMonth) obj.current = true
                this.month.push(obj)
                this.days.push(this.setDays(i))
            }
        },
        setDays(month) {
            const arr = []
            let year = this.currentYear
            if (month < this.currentMonth) year += 1
            const firstDate = new Date()
            const lastDate = new Date()
            const flagDate = new Date()
            firstDate.setFullYear(year, month, 1)
            lastDate.setFullYear(year, month + 1, 0)
            flagDate.setFullYear(year, month, 1)
            for (let i = 0; i < 42; i++) {
                const obj = {
                    year: year,
                    label: '',
                    value: '',
                    status: '',
                    nationalHoliday: false
                }
                arr.push(obj)
            }
            arr.forEach((item, index) => {
                let firstDayIndex = firstDate.getDay() - 1
                if (firstDayIndex === -1) firstDayIndex = 6
                if (index >= firstDayIndex && index < lastDate.getDate() + firstDayIndex) {
                    item.label = flagDate.getDate()
                    item.value = flagDate.toISOString().slice(5, 10).replace(/-/g, '')
                    if (flagDate.getDay() === 6 || flagDate.getDay() === 0) item.nationalHoliday = true
                    flagDate.setDate(flagDate.getDate() + 1)
                }
            })
            return arr
        },
        setNationalDate(data) {
            const hasKey = Object.keys(data[0]).indexOf('西元日期') > -1 &&
                         Object.keys(data[0]).indexOf('是否放假') > -1 &&
                         Object.keys(data[0]).indexOf('星期') > -1
            if (!hasKey) return this.$Message.error(this.$t('Error.File'))

            const holiday = data.filter(item =>
                item['是否放假'] === '2' &&
                    item['星期'] !== '六' &&
                    item['星期'] !== '日'
            )
            this.setStatus(holiday, 'holiday')

            const workingDay = data.filter(item =>
                (item['是否放假'] === '0' &&
                item['星期'] === '六') ||
                (item['是否放假'] === '0' &&
                item['星期'] === '日')
            )
            this.setStatus(workingDay, 'workingday')
        },
        setStatus(data, status) {
            const year = parseInt(data[0]['西元日期'].slice(0, 4))
            data = data.map(item => item['西元日期'].slice(4, 8))
            data.forEach(item => {
                const month = parseInt(item.slice(0, 2)) - 1
                const index = this.days[month]
                    .findIndex(daysItem => item === daysItem.value &&
                                                       year === daysItem.year)
                if (index > -1 && status)
                    this.days[month][index].status = status
            })
        },
        async saveData() {
            this.saveLoading = true
            const allDays = this.days.reduce((prev, curr) => [...prev, ...curr])
            const holiday = allDays.filter(item => item.status === 'holiday')
                .map(item => item.value)
                .join(',')
            const workingDay = allDays.filter(item => item.status === 'workingday')
                .map(item => item.value)
                .join(',')
            const config = {
                method: 'post',
                path: '/1/sys/c/env/parameter/update/',
                obj: {
                    NATIONAL_HOLIDAY: holiday,
                    WORK_ON_WEEKENDS: workingDay
                },
                success: this.saveDataSuccess,
                error: this.saveDataError,
                final: () => { this.saveLoading = false }
            }
            await this.ajax(config)
            this.getData()
        },
        saveDataSuccess(response) {
            this.$Message.success(this.$t('Save') + this.$t('Success'))
        },
        saveDataError(response) {
            let errMsg = this.$t('Error.WorkingDay.SaveGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        changeStatus(item) {
            if (!item.status && item.nationalHoliday === true)
                item.status = 'workingday'
            else if (!item.status && item.nationalHoliday === false)
                item.status = 'holiday'
            else if (item.status)
                item.status = ''
        },
        uploadChange(data) {
            const reader = new FileReader()
            const _this = this
            reader.onload = e => {
                if (_this.isJson(e.target.result))
                    _this.importArr = JSON.parse(e.target.result)
                else
                    _this.$Message.error(this.$t('Error.JSON'))
            }
            reader.readAsText(data)
        },
        reset() {
            this.month.forEach((item, index) => {
                this.days[index].forEach(daysItem => {
                    daysItem.status = ''
                })
            })
            this.importArr = []
        }
    },
    watch: {
        importArr(data) {
            if (!data || data.length === 0) return
            this.setNationalDate(data)
        }
    }
}
</script>