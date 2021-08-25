<template>
    <Modal  v-model="eventModalShow"
            width="400px" :styles="{top: '40px'}"
            footer-hide >
        <div slot="header" class="fz--large">
            {{setModalTitle()}}
        </div>
        <div v-show="fromStatus === 0" class="m-event-modal noselect" @click="hideContextmenu()">
            <Form ref="eventFrom" :model="eventFrom">
                <!-- 日期 -->
                <div class="fz--primary mb-5">{{$t('Date')}}</div>
                <FormItem prop="date">
                    <DispatchDatepicker v-model="eventFrom.date" ref="datepicker"/>
                </FormItem>
                <!-- 專案 -->
                <div class="fz--primary mb-5">{{$t('Project')}}</div>
                <FormItem prop="project">
                    <Selector v-model="eventFrom.project" :placeholder="$t('PlaceHolder.PleaseChoose')">
                        <Options>
                            <div class="select-option" @click="fromStatus = 1">
                                <Icon type="ios-add" class="select-option__icon"/>
                            </div>
                        </Options>
                        <Options v-for="(item,index) in projectList"
                                 :value="item.id"
                                 :label="item.name"
                                 :key="index">
                            <div class="select-option" @contextmenu.stop="showProjectMenu($event,item)">
                                <div class="select-option__title">{{item.name}}</div>
                                <div class="select-option__sub-title"></div>
                            </div>
                        </Options>
                    </Selector>
                </FormItem>
                <!-- 公司 -->
                <div class="fz--primary mb-5">{{$t('Company')}}</div>
                <FormItem prop="company">
                    <Selector v-model="eventFrom.outsourcing" :placeholder="$t('PlaceHolder.PleaseChoose')">
                        <Options>
                            <div class="select-option" @click="fromStatus = 2">
                                <Icon type="ios-add" class="select-option__icon"/>
                            </div>
                        </Options>
                        <Options v-for="(item,index) in companyList"
                                 :value="item.id"
                                 :label="item.name"
                                 :key="index">
                            <div class="select-option" @contextmenu.stop="showCompanyMenu($event,item)">
                                <div class="select-option__title">{{item.name}}</div>
                                <div class="select-option__sub-title">{{item.alias}}</div>
                            </div>
                        </Options>
                    </Selector>
                </FormItem>
                <!-- 公司權重 -->
                <div class="fz--primary mb-5">{{$t('Priority')}}</div>
                <FormItem prop="priority">
                    <Select v-model="eventFrom.priority">
                        <Option v-for="item in priorityList"
                                :value="item.value"
                                :key="item.value">{{ item.label }}
                        </Option>
                    </Select>
                </FormItem>
            </Form>
        </div>
        <div v-show="fromStatus === 0" class="d-flex d-flex--justify-end">
            <Button size="large"
                    class="btn btn--outline mr-10"
                    @click="handleReset('eventFrom')">
                    {{$t('Reset')}}
            </Button>
            <Button size="large"
                    type="primary"
                    class="btn"
                    :loading="apiLoading"
                    :disabled="disableSave()"
                    @click.stop="handleSave()">
                    {{$t('Save')}}
            </Button>
        </div>
        <!-- 專案資訊 -->
        <ProjectForm v-model="fromStatus"
                    v-show="fromStatus === 1" ref="projectForm"/>
        <!-- 委外公司資訊 -->
        <CompanyForm v-model="fromStatus"
                    v-show="fromStatus === 2" ref="companyForm"/>
        <!-- 專案 contextmenu -->
        <Contextmenu v-model="projectMenuShow" ref="projectMenu">
            <MenuItem :label="$t('Edit')"
                        :icon="'ios-create-outline'"
                        @click="editProject()"/>
            <MenuItem :label="$t('Delete')"
                        :icon="'md-trash'"
                        @click="deleteProject()" />
        </Contextmenu>
        <!-- 委外公司 contextmenu -->
        <Contextmenu v-model="companyMenuShow" ref="companyMenu">
            <MenuItem :label="$t('Edit')"
                        :icon="'ios-create-outline'"
                        @click="editCompany()" />
            <MenuItem :label="$t('Delete')"
                        :icon="'md-trash'"
                        @click="deleteCompany()"/>
        </Contextmenu>
    </Modal>
</template>
<script>
import ProjectForm from '@/components/dispatch/form-project.vue'
import CompanyForm from '@/components/dispatch/form-company.vue'
import DispatchDatepicker from '@/components/dispatch/datepicker.vue'
export default {
    name: 'AddEvent',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        date: {
            type: Number
        },
        eventsPool: {
            type: Array
        }
    },
    components: {
        ProjectForm,
        CompanyForm,
        DispatchDatepicker,
        Contextmenu: resolve => require(['@/components/contextmenu/contextmenu.vue'], resolve),
        MenuItem: resolve => require(['@/components/contextmenu/menu-item.vue'], resolve),
        Selector: resolve => require(['@/components/select/select.vue'], resolve),
        Options: resolve => require(['@/components/select/option.vue'], resolve)
    },
    data() {
        return {
            fromStatus: 0,
            eventFrom: {
                date: [],
                project: '',
                outsourcing: '',
                priority: 3
            },
            projectList: [],
            companyList: [],
            priorityList: [
                {
                    value: 0,
                    label: this.$t('Realtime')
                },
                {
                    value: 1,
                    label: this.$t('High')
                },
                {
                    value: 2,
                    label: this.$t('AboveNormal')
                },
                {
                    value: 3,
                    label: this.$t('Normal')
                },
                {
                    value: 4,
                    label: this.$t('BelowNormal')
                },
                {
                    value: 5,
                    label: this.$t('Low')
                }
            ],
            colorMap: {},
            selectCompany: null,
            selectProject: null,
            apiLoading: false,
            // components show
            eventModalShow: false,
            companyMenuShow: false,
            projectMenuShow: false,
            datePickerShow: false
        }
    },
    created() {
        this.getCompanyList()
        this.getProjectList()
    },
    methods: {
        getCompanyList() {
            const config = {
                method: 'get',
                path: '/1/ins/c/outsourcing/all/get/',
                success: this.getCompanyListSuccess,
                error: this.getCompanyListError
            }
            this.ajax(config)
        },
        getCompanyListSuccess(response) {
            if (response.data.data && response.data.data.length > 0)
                this.companyList = response.data.data
        },
        getCompanyListError(response) {
            let errMsg = this.$t('Error.Company.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        getProjectList() {
            const config = {
                method: 'get',
                path: '/1/ins/c/project/all/get/',
                success: this.getProjectListSuccess,
                error: this.getProjectListError
            }
            this.ajax(config)
        },
        getProjectListSuccess(response) {
            if (response.data.data && response.data.data.length > 0)
                this.projectList = response.data.data
        },
        getProjectListError(response) {
            let errMsg = this.$t('Error.Project.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        handleSave() {
            this.apiLoading = true
            const obj = { data: this.transToPost(this.eventFrom) }
            const config = {
                method: 'post',
                path: '/1/ins/c/order/calendar/create/',
                obj: obj,
                success: this.handleSaveSuccess,
                error: this.handleSaveError,
                final: this.handleSaveFinal
            }
            this.ajax(config)
        },
        handleSaveSuccess() {
            this.eventModalShow = false
            this.$Message.success(this.$t('Save') + this.$t('Success'))
            this.$emit('on-saved')
        },
        handleSaveError(response) {
            let errMsg = this.$t('Error.OrderCalendar.CreateGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 錯誤的資料內容
                    errMsg += this.$t('Error.OrderCalendar.Code1')
                    break
                case 2:
                    // 錯誤的委外識別碼
                    errMsg += this.$t('Error.OrderCalendar.Code2')
                    break
                case 3:
                    // 錯誤的專案識別碼
                    errMsg += this.$t('Error.OrderCalendar.Code3')
                    break
                case 4:
                    // 錯誤的天數
                    errMsg += this.$t('Error.OrderCalendar.Code4')
                    break
                case 5:
                    // 錯誤的優先權
                    errMsg += this.$t('Error.OrderCalendar.Code5')
                    break
                case 6:
                    // 錯誤的Meta格式
                    errMsg += this.$t('Error.OrderCalendar.Code6')
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
        handleSaveFinal(response) {
            this.apiLoading = false
        },
        handleReset(name) {
            this.$refs[name].resetFields()
            this.eventFrom.project = ''
            this.eventFrom.outsourcing = ''
        },
        setModalTitle() {
            let title = ''
            switch (this.fromStatus) {
            case 0:
                title = `${this.$t('Dispatch')}${this.$t('Setting')}`
                break
            case 1:
                title = `${this.$t('Project')}${this.$t('Information')}`
                break
            case 2:
                title = `${this.$t('Outsourcing')}${this.$t('Company')}${this.$t('Information')}`
                break
            default:
                break
            }
            return title
        },
        setDate(data) {
            const arr = []
            arr.push(data)
            this.eventFrom.date = arr
        },
        showProjectMenu(e, item) {
            this.$refs.projectMenu.setPos(e.clientX, e.clientY)
            this.$refs.projectForm.setData(item)
            this.projectMenuShow = true
            e.preventDefault()
        },
        showCompanyMenu(e, item) {
            this.$refs.companyMenu.setPos(e.clientX, e.clientY)
            this.$refs.companyForm.setData(item)
            this.companyMenuShow = true
            e.preventDefault()
        },
        hideContextmenu() {
            this.companyMenuShow = false
            this.projectMenuShow = false
        },
        disableSave() {
            if (!this.eventFrom.date || this.eventFrom.date.length === 0)
                return true
            else if (!this.eventFrom.project) return true
            else if (!this.eventFrom.outsourcing) return true
            return false
        },
        deleteCompany() {
            this.$refs.companyForm.deleteConfirm()
            this.companyMenuShow = false
        },
        deleteProject() {
            this.$refs.projectForm.deleteConfirm()
            this.projectMenuShow = false
        },
        editCompany() {
            this.fromStatus = 2
            this.companyMenuShow = false
        },
        editProject() {
            this.fromStatus = 1
            this.projectMenuShow = false
        },
        transToPost(input) {
            const data = this.deepCopy(input)
            const arr = []
            const obj = {}
            let defaultColor = '#0D8EA8'
            const key = `${data.project}${data.outsourcing}`
            if (this.colorMap[key]) defaultColor = this.colorMap[key]
            data.date.forEach(item => {
                const obj = {
                    day: item,
                    project: data.project,
                    outsourcing: data.outsourcing,
                    priority: data.priority,
                    meta: {
                        color: defaultColor
                    }
                }
                arr.push(obj)
            })
            obj.orders = arr
            return JSON.stringify(obj)
        }
    },
    watch: {
        value(data) {
            this.eventModalShow = data
        },
        eventModalShow(data) {
            this.$emit('input', data)
            if (!data) {
                this.fromStatus = 0
                this.handleReset('eventFrom')
            }
            else if (this.date)
                this.setDate(this.date)
        },
        date(data) {
            this.setDate(data)
        },
        fromStatus(data) {
            if (data === 0) {
                this.getCompanyList()
                this.getProjectList()
            }
        },
        eventsPool(data) {
            const colorMap = data.reduce((acc, crr) => {
                const key = `${crr.project.id}${crr.outsourcing.id}`
                const color = crr.meta && crr.meta.color ? crr.meta.color : '#0D8EA8'
                if (!acc[key]) acc[key] = color
                return acc
            }, {})
            this.colorMap = colorMap
        }
    }
}
</script>