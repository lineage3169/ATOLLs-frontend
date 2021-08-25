<template>
    <Modal v-model="userModal"
           width="800px" :styles="{top: '20px'}"
           :class-name="'m-config-user-modal'">
        <h1 slot="header" class="fz--large">
            {{ $t('Change') }}{{ $t('User') }}
        </h1>
        <!-- 使用者資訊 -->
        <Form label-position="left" :model="personalForm">
            <div class="form">
                <!-- 使用者名稱 -->
                <div class="form__items">
                    <div class="form__items__label">
                        {{$t('User') + $t('Name')}}
                    </div>
                    <FormItem>
                        <Tooltip max-width="200" :content="$t('Tooltips.UserNameAdd')" style="width: 100%;">
                            <Input  v-model="personalForm.username"
                                    class="form-input"
                                    :disabled="isAdmin" />
                        </Tooltip>
                    </FormItem>
                </div>
                <div class="form__items">
                    <!-- fake div -->
                </div>
                <!-- 重設使用者密碼 -->
                <div class="form__items d-flex justify-end">
                    <Button v-if="username === 'atoll'"
                            class="btn btn--outline fz--primary mt-20"
                            @click.stop="passwordShow = true">
                        {{`${$t('Reset')}${$t('User')}${$t('Password')}`}}
                    </Button>
                </div>
                <!-- 名字 -->
                <div class="form__items">
                    <div class="form__items__label">
                        {{$t('FirstName')}}
                    </div>
                    <FormItem >
                        <Input v-model="personalForm.firstName" class="form-input" />
                    </FormItem>
                </div>
                <!-- 姓氏 -->
                <div class="form__items">
                    <div class="form__items__label">
                        {{$t('LastName')}}
                    </div>
                    <FormItem >
                        <Input v-model="personalForm.lastName" class="form-input" />
                    </FormItem>
                </div>
                <div class="form__items">
                    <!-- fake div -->
                </div>
                <!-- 電子郵件地址 -->
                <div class="form__items">
                    <div class="form__items__label">
                        {{$t('EMail') + $t('Address')}}
                    </div>
                    <FormItem>
                        <Input v-model="personalForm.email" class="form-input" />
                    </FormItem>
                </div>
                <div class="form__items">
                    <!-- fake div -->
                </div>
                <div class="form__items">
                    <!-- fake div -->
                </div>
                <!-- 委外公司 -->
                <div v-if="!isParkingMgnt" class="form__items">
                    <div class="form__item__label">
                        {{$t('Outsourcing') + $t('Company')}}
                    </div>
                    <FormItem class="mb-0">
                        <Select v-model="personalForm.profile.outsourcing"
                                class="form__item__input"
                                :disabled="notGetOutsourcing"
                                :placeholder="$t('PlaceHolder.Select')">
                            <Option v-for="item in outsourcingList"
                                    :value="item.value"
                                    :key="item.value">{{ item.label }}
                            </Option>
                        </Select>
                    </FormItem>
                </div>
            </div>
        </Form>
        <!-- 權限 -->
        <div class="prem">
            <div v-if="!isAdmin" class="prem__items">
                <div class="form__items__label">
                    <Tooltip max-width="200" :content="$t('Tooltips.UserActive')">
                        {{$t('ActiveA')}}
                    </Tooltip>
                </div>
                <i-switch v-model="permissionForm.isActive" />
            </div>
        </div>
        <div v-if="featuresCheckbox.length === 0" class="alert">
            * 產品尚未啟用，無法設定權限
        </div>
        <div v-else class="checkbox noselect">
            <!-- 使用者權限 -->
            <div class="checkbox__type-title">
                {{`${$t('User')}${$t('Permission')}`}}
            </div>
            <div class="checkbox__all">
                <Checkbox v-model="featuresSelectAll"
                            :label="$t('ALL')"
                            :indeterminate="featuresIndeterminate"
                            :disabled="personalForm.username === 'atoll'">
                    {{$t('ALL')}}
                </Checkbox>
            </div>
            <Collapse v-model="collapse" simple>
                <Panel v-for="(modulesItem, modulesIndex) in modules"
                    :key="modulesIndex"
                    :name="modulesItem.label">
                    <span class="fz--primary">
                        {{ permissionMapping(modulesItem.label) }}
                    </span>
                    <div v-for="(menuItem, menuIndex) in modulesItem.menu"
                        slot="content"
                        :key="menuIndex">
                        <div class="checkbox__area-title"
                            :key="'checkbox__area-title' + menuIndex">
                            {{permissionMapping(menuItem)}}
                        </div>
                        <div class="checkbox__area"
                            :key="'checkbox__area' + menuIndex">
                            <template v-for="(item, index) in featuresCheckbox">
                                <div v-if="item.modules === modulesItem.label && item.menu === menuItem"
                                    class="checkbox__items"
                                    :key="'checkbox__items' + index">
                                    <Checkbox v-model="item.isSelected"
                                            :label="item.label"
                                            :disabled="item.disable">
                                        {{permissionMapping(item.label)}}
                                    </Checkbox>
                                </div>
                            </template>
                        </div>
                    </div>
                </Panel>
            </Collapse>
            <!-- 資料權限 -->
            <template v-if="groups.length > 0">
                <div class="checkbox__type-title mt-5">
                    {{`${$t('Data')}${$t('Permission')}`}}
                </div>
                <div class="checkbox__all">
                    <Checkbox v-model="selectAll"
                            :label="$t('ALL')"
                            :indeterminate="indeterminate" >
                        {{$t('ALL')}}
                    </Checkbox>
                </div>
                <div class="checkbox__area">
                    <div v-for="(item, index) in groupCheckbox"
                        class="checkbox__items"
                        :key="index">
                        <Checkbox v-model="item.isSelected"
                                :label="item.label"
                                :disabled="item.disable">
                            {{item.label}}
                        </Checkbox>
                    </div>
                </div>
            </template>
        </div>
        <div slot="footer">
            <Button class="btn btn--outline fz--primary"
                    @click.stop="userModal = false">
                    {{`${$t('Cancel')}`}}
            </Button>
            <Button class="btn fz--primary"
                    :loading="apiLoading"
                    @click.stop="handleSave()">
                    {{`${$t('Save')}`}}
            </Button>
        </div>
        <Password v-model="passwordShow" :user-id="userId" force/>
    </Modal>
</template>
<script>
import Password from '@/components/modal/password.vue'
import permission from './i18n/permission'
export default {
    name: 'UserEditModal',
    components: { Password },
    props: {
        value: {
            type: Boolean,
            default: false
        },
        userInfo: {
            type: Object,
            required: true
        }
    },
    data() {
        return {
            isAdmin: false,
            userModal: false,
            selectAll: false,
            indeterminate: false,
            featuresSelectAll: false,
            featuresIndeterminate: false,
            personalForm: {
                username: '',
                firstName: '',
                lastName: '',
                email: '',
                profile: {
                    outsourcing: ''
                }
            },
            permissionForm: {
                isActive: false,
                isStaff: false,
                isSuperuser: false
            },
            groups: [],
            userGroup: [],
            outsourcingList: [],
            groupCheckbox: [],
            featuresCheckbox: [],
            permissionMap: permission(this),
            modules: [],
            collapse: ['PM', 'INS', 'SYS'], // 預設開啟面板
            userId: null,
            userFeatures: '',
            username: this.$store.state.username,
            apiLoading: false,
            passwordShow: false
        }
    },
    created() {
        if (!this.isParkingMgnt)
            this.getOutsourcingInfo()
        this.getFeatures()
        this.getGroups()
    },
    methods: {
        setGroup() {
            this.groupCheckbox = []
            this.groupCheckbox = this.groups.map(item => {
                const obj = {
                    key: item.id,
                    label: item.alias,
                    value: item.name,
                    isSelected: false,
                    disable: false
                }
                return obj
            })
        },
        setGroupCheckbox() {
            this.groupCheckbox.forEach(element => {
                const isUserGroup = this.userGroup.indexOf(parseInt(element.key)) > -1
                if (isUserGroup)
                    element.isSelected = true
            })
        },
        setFeaturesCheckbox() {
            if (!this.userFeatures) return
            const features = this.userFeatures.split(',')
            this.featuresCheckbox = this.featuresCheckbox.map(item => {
                if (features.indexOf(item.value) > -1)
                    item.isSelected = true
                return item
            })
        },
        getGroups() {
            // Get all groups
            const config = {
                method: 'get',
                path: '/1/sys/c/groups/get/',
                success: response => {
                    this.groups = response.data.data
                    if (this.groups && this.groups.length > 0)
                        this.setGroup()
                },
                error: this.getGroupsError,
                final: () => {
                    if (this.title !== 'ChangeAddress')
                        this.confirmModal = false
                }
            }
            this.ajax(config)
        },
        getGroupsError(response) {
            var errMsg = this.$t('Error.Groups.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        getFeatures() {
            const config = {
                method: 'post',
                path: '/1/sys/c/license/features/get/',
                success: this.getFeaturesSuccess,
                error: this.getFeaturesError
            }
            return this.ajax(config)
        },
        getFeaturesSuccess(response) {
            if (!response.data || !response.data.data) return
            let data = []
            if (typeof (response.data.data) === 'string')
                data = response.data.data.split(',')
            // 只處理三層之資料
            data = data.filter(item => item.split('@').length === 3)
            // 依模組分類選單
            const menu = data.reduce((acc, cur) => {
                const modules = cur.split('@')[2]
                const menu = cur.split('@')[1]
                if (!acc[modules]) acc[modules] = new Set()
                acc[modules].add(menu)
                return acc
            }, {})
            // Object 轉 array
            this.modules = Object.entries(menu).map(item => {
                const obj = {
                    label: item[0],
                    menu: [...item[1]]
                }
                return obj
            })
            // checkbox
            this.featuresCheckbox = data.map(item => {
                const modules = item.split('@')[2]
                const menu = item.split('@')[1]
                const label = item.split('@')[0]
                const obj = {
                    modules: modules,
                    menu: menu,
                    value: item,
                    label: label,
                    disable: false,
                    isSelected: false
                }
                return obj
            })
        },
        getFeaturesError(response) {
            let errMsg = this.$t('Error.License.FeatureGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 未註冊授權碼
                    return
                case 2:
                    // 無法解析授權碼
                    errMsg += this.$t('Error.License.Code2')
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
        resetCheckbox() {
            this.groupCheckbox.forEach(el => {
                el.isSelected = false
                el.disable = false
            })
            this.featuresCheckbox.forEach(el => {
                el.isSelected = false
                el.disable = false
            })
        },
        async handleSave() {
            await this.saveFeatures()
            if (this.personalForm.profile.outsourcing)
                await this.setProfile()
            this.saveGroups()
        },
        saveFeatures() {
            this.apiLoading = true
            const features = this.featuresCheckbox
                .filter(item => item.isSelected === true)
                .map(item => item.value)
                .join(',')
            const postObj = {
                user_id: this.userId,
                features: features
            }
            const config = {
                method: 'post',
                path: '/1/sys/c/license/user/features/update/',
                obj: postObj,
                success: () => {
                    let content = `${this.$t('User')}${this.$t('Permission')}`
                    content += `${this.$t('Setting')}${this.$t('Success')}`
                    this.$Message.success(content)
                },
                error: this.saveFeaturesError,
                final: this.apiLoading = false
            }
            this.ajax(config)
        },
        saveFeaturesError(response) {
            let errMsg = this.$t('Error.FeaturesUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供 User ID 或 Features
                    errMsg += this.$t('Error.FeaturesUpdate.Code1')
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
        saveGroups() {
            this.apiLoading = true
            let sGroup = []
            sGroup = this.groupCheckbox
                .filter(item => item.isSelected === true)
                .map(item => item.key)
            const postObj = {
                username: this.userInfo.username,
                personal: JSON.stringify(this.personalForm),
                permission: JSON.stringify(this.permissionForm),
                group: JSON.stringify(sGroup)
            }
            const config = {
                method: 'post',
                path: '/1/sys/c/user/update/',
                obj: postObj,
                success: () => {
                    let content = `${this.$t('Data')}${this.$t('Permission')}`
                    content += `${this.$t('Setting')}${this.$t('Success')}`
                    this.$Message.success(content)
                    this.$emit('refresh')
                },
                error: this.saveGroupsError,
                final: () => {
                    this.apiLoading = false
                    this.userModal = false
                }
            }
            return this.ajax(config)
        },
        saveGroupsError(response) {
            let errMsg = this.$t('Error.UserChange.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 使用者名稱不可使用
                    errMsg += this.$t('Error.UserChange.Code1')
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
        lockPolicyCheckbox() {
            const username = this.personalForm.username
            this.featuresCheckbox = this.featuresCheckbox
                .map(item => {
                    if (username === 'Admin') {
                        const isConfig = item.value === 'system-config@admin@SYS'
                        const isUser = item.value === 'system-user@admin@SYS'
                        if (isConfig || isUser) {
                            item.isSelected = true
                            item.disable = true
                        }
                    }
                    if (username === 'atoll') {
                        item.isSelected = true
                        item.disable = true
                    }
                    return item
                })
        },
        permissionMapping(str) {
            const mapArr = Object.keys(this.permissionMap)
                .filter(key => key === str)
            if (mapArr.length === 1) return this.permissionMap[str]
            else return str
        },
        filterBackend(val) {
            const index = this.modules
                .findIndex(item => item.label === 'SYS')
            if (index > -1) {
                this.modules[index].menu = this.modules[index].menu
                    .filter(item => item !== 'backend')
                if (val.username === 'atoll' || val.is_superuser === true)
                    this.modules[index].menu.unshift('backend')
            }
        },
        getOutsourcingInfo() {
            this.notGetOutsourcing = false
            const config = {
                method: 'get',
                path: '/1/ins/c/outsourcing/all/get/',
                success: this.getOutsourcingSuccess,
                error: this.getOutsourcingError
            }
            this.ajax(config)
        },
        getOutsourcingSuccess(response) {
            if (!response || !response.data) {
                this.notGetOutsourcing = true
                return
            }
            if (!response.data.data || response.data.data.length === 0) {
                this.notGetOutsourcing = true
                return
            }
            this.setOutsourcing(response.data.data)
        },
        setOutsourcing(input) {
            const data = this.deepCopy(input)
            this.outsourcingList = data.map(item => {
                const obj = {
                    label: `${item.name} (${item.alias})`,
                    value: item.id
                }
                return obj
            })
        },
        setProfile() {
            this.apiLoading = true
            const postObj = {
                userProfile: JSON.stringify(this.personalForm.profile),
                userId: this.userId
            }
            const config = {
                method: 'post',
                path: '/1/sys/c/user/profile/update/',
                obj: postObj,
                error: this.setProfileError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        setProfileError(response) {
            let errMsg = ''
            const str = `${this.$t('Error.Unexpected')}`
            errMsg = `${str}(${response.status})<br>` + response.data
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        initUser(val) {
            const profile = val.profile
            this.userId = val.id
            this.userFeatures = val.features
            this.personalForm.username = val.username
            this.personalForm.firstName = val.first_name
            this.personalForm.lastName = val.last_name
            this.personalForm.email = val.email
            this.personalForm.profile.outsourcing = profile.outsourcing || ''
            if (profile.language)
                this.personalForm.profile.language = profile.language
            if (profile?.camera_scan)
                this.personalForm.profile.camera_scan = true
            this.permissionForm.isActive = val.is_active
            this.permissionForm.isStaff = val.is_staff
            this.permissionForm.isSuperuser = val.is_superuser
        }
    },
    watch: {
        value(data) {
            this.userModal = data
        },
        userModal(data) {
            this.$emit('input', data)
        },
        userInfo(val, oldVal) {
            this.initUser(val)
            const valGroups = JSON.parse(val.groups)
            const userGroupsArr = []
            for (let i = 0; i < valGroups.length; i++)
                userGroupsArr.push(valGroups[i].pk)

            this.userGroup = userGroupsArr
            this.isAdmin = false
            if (val.username === 'Admin' || val.username === 'atoll')
                this.isAdmin = true
            // 只有 supper user 可看見 backend
            this.filterBackend(val)
            this.resetCheckbox()
            this.setGroupCheckbox()
            if (this.isAdmin)
                this.lockPolicyCheckbox()
            if (val.username !== 'atoll')
                this.setFeaturesCheckbox()
        },
        selectAll(data) {
            if (typeof (data) === 'boolean') {
                this.groupCheckbox = this.groupCheckbox.map(item => {
                    item.isSelected = data
                    return item
                })
            }
        },
        featuresSelectAll(data) {
            const username = this.personalForm.username
            if (data === true) {
                this.featuresCheckbox = this.featuresCheckbox
                    .map(item => {
                        item.isSelected = true
                        return item
                    })
            }
            else {
                this.featuresCheckbox = this.featuresCheckbox
                    .map(item => {
                        item.isSelected = false
                        if (username === 'Admin') {
                            const isConfig = item.value === 'system-config@admin@SYS'
                            const isUser = item.value === 'system-user@admin@SYS'
                            if (isConfig || isUser) {
                                item.isSelected = true
                                item.disable = true
                            }
                        }
                        if (username === 'atoll') {
                            item.isSelected = true
                            item.disable = true
                        }
                        return item
                    })
            }
        },
        groupCheckbox: {
            deep: true,
            handler: function(newVal, oldVal) {
                let count = 0
                newVal.forEach(element => {
                    if (element.isSelected === true)
                        count += 1
                })
                if (count === this.groupCheckbox.length) {
                    this.indeterminate = false
                    this.selectAll = true
                }
                else if (count > 0) this.indeterminate = true
                else {
                    this.indeterminate = false
                    this.selectAll = false
                }
            }
        },
        featuresCheckbox: {
            deep: true,
            handler: function(newVal, oldVal) {
                let count = 0
                newVal.forEach(element => {
                    if (element.isSelected === true)
                        count += 1
                })
                if (count === this.featuresCheckbox.length) {
                    this.featuresIndeterminate = false
                    this.featuresSelectAll = true
                }
                else if (count > 0)
                    this.featuresIndeterminate = true
                else {
                    this.featuresIndeterminate = false
                    this.featuresSelectAll = false
                }
            }
        }
    },
    computed: {
        isParkingMgnt() {
            return this.$store.state.moduleType === 'PM'
        }
    }
}
</script>