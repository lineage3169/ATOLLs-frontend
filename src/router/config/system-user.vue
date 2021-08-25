<template>
    <div class="m-config-system-user">
        <div class="tools">
            <div class="tools-left">
                <div class="tools-left__search">
                    <input  v-model="quickSearchTxt"
                            :placeholder="`${$t('Quick')}${$t('Search')}...`"
                            type="text"
                            @input="handleQuickSearch">
                    <div class="tools-left__search__icon" @click.stop="resetQuickSearch">
                        <Icon type="ios-close-circle-outline"/>
                    </div>
                </div>
            </div>
            <div class="tools-right">
                <Button class="btn btn--long fz--primary"
                    type="primary"
                    @click.stop="addModal = true">
                    {{`${$t('Add')}${$t('User')}`}}
                </Button>
            </div>

        </div>
        <div class="list">
            <template v-for="(item, index) in data" >
                <div class="list-items" :key="index">
                    <div class="list-items--top">
                        <div class="list-items--top-left">
                            <div class="list-items__status">
                                <template v-if="item.is_active">
                                    <Icon type="md-checkmark-circle" style="color: #39db71;"/>
                                </template>
                                <template v-else>
                                    <Icon type="md-close-circle" style="color: #ed0000;"/>
                                </template>
                            </div>
                            <div class="list-items__user-name">
                                {{item.username}}
                            </div>
                        </div>
                        <div class="list-items--top-right">
                            <div class="name">
                                {{`${item.first_name} ${item.last_name}`}}
                            </div>
                        </div>
                    </div>
                    <div class="list-items--bottom">
                        <div class="list-items__email">
                            {{item.email}}
                        </div>
                    </div>
                    <transition name="fade">
                        <div class="list-items__menu">
                            <div class="list-items__menu__container">
                                <div class="list-items__menu__items" @click.stop="show(index,item.id)">
                                    <div class="list-items__menu__items__icon">
                                        <Icon type="md-settings" />
                                    </div>
                                    <div class="list-items__menu__items__title">
                                        {{$t('Change')}}
                                    </div>
                                </div>
                                <div v-if="item.is_superuser == false && item.username != 'Admin'"
                                    class="list-items__menu__items"
                                    @click.stop="deleteConirm(index,item.username)">
                                    <div class="list-items__menu__items__icon">
                                        <Icon type="ios-trash-outline" />
                                    </div>
                                    <div class="list-items__menu__items__title">
                                        {{$t('Delete')}}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </transition>
                </div>
            </template>
        </div>
        <div v-if="errorMsg" class="error-msg">
            {{errorMsg}}
        </div>
        <UserModal v-model="userModal"
                    :user-info="userInfo"
                    @refresh="getUserBaseInfo"/>
        <UserAdd v-model="addModal"
                ref="userAdd"
                @refresh="getUserBaseInfo"/>
        <DeleteConfirm v-model="deleteModalShow"
            :msg="deleteUserName"
            :loading="deleteLoading"
            :on-ok="deleteUser"/>
    </div>
</template>

<script>
import UserModal from '@/components/modal/config/user-edit.vue'
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'ConfigUserChange',
    components: {
        UserModal,
        DeleteConfirm,
        UserAdd: resolve => require(['@/components/modal/config/user-add.vue'], resolve)
    },
    data() {
        return {
            addModal: false,
            deleteModalShow: false,
            deleteIndex: null,
            deleteUserName: '',
            deleteLoading: false,
            userModal: false,
            userInfo: {},
            columns: [
                {
                    title: this.$t('User') + this.$t('Name'),
                    key: 'username',
                    fixed: 'left',
                    render: (h, params) => {
                        return h('div', [
                            h('Icon', {
                                props: {
                                    type: 'person'
                                }
                            }),
                            h('strong', params.row.username)
                        ])
                    }
                },
                {
                    title: this.$t('EMail') + this.$t('Address'),
                    key: 'email'
                },
                {
                    title: this.$t('FirstName'),
                    key: 'first_name'
                },
                {
                    title: this.$t('LastName'),
                    key: 'last_name'
                },
                {
                    title: this.$t('Staff') + this.$t('Status'),
                    key: 'is_staff',
                    align: 'center',
                    render: (h, params) => {
                        var iconType = 'md-close'
                        if (params.row.is_staff)
                            iconType = 'md-checkmark-circle'

                        return h('div', [
                            h('Icon', {
                                props: {
                                    type: iconType
                                }
                            })
                        ])
                    }
                },
                {
                    title: this.$t('Action'),
                    key: 'action',
                    align: 'center',
                    width: 180,
                    fixed: 'right',
                    render: (h, params) => {
                        var buttonDiasble = false
                        if (params.row.is_superuser)
                            buttonDiasble = true

                        return h('div', [
                            h('Button', {
                                props: {
                                    type: 'success',
                                    size: 'small',
                                    ghost: true
                                },
                                style: {
                                    marginRight: '5px'
                                },
                                on: {
                                    click: () => {
                                        this.show(params.index)
                                    }
                                }
                            }, this.$t('Change')),
                            h('Button', {
                                props: {
                                    type: 'error',
                                    size: 'small',
                                    ghost: true,
                                    disabled: buttonDiasble
                                },
                                on: {
                                    click: () => {
                                        this.delete(params.index)
                                    }
                                }
                            }, this.$t('Delete'))
                        ])
                    }
                }
            ],
            superuserLevel: [],
            AdminLevel: [],
            userLevel: [],
            dataPool: [],
            data: [],
            quickSearchTxt: '',
            errorMsg: '',
            userFeatures: '',
            userProfile: ''
        }
    },
    created() {
        this.getUserBaseInfo()
    },
    methods: {
        async show(index, id) {
            await this.getProfile(id)
            // Get user info
            const config = {
                method: 'post',
                path: '/1/sys/c/user/detail/get/',
                obj: { username: this.data[index].username },
                success: response => {
                    this.userInfo = response.data.data
                    this.userInfo.id = id
                    this.userInfo.features = this.userFeatures || ''
                    this.userInfo.profile = this.userProfile || ''
                    this.userModal = true
                },
                error: this.showError
            }
            await this.ajax(config)
        },
        showError(response) {
            var errMsg = this.$t('Error.User.GetDetailGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        deleteUser() {
            const index = this.deleteIndex
            const config = {
                method: 'post',
                path: '/1/sys/c/user/delete/',
                obj: { username: this.data[index].username },
                params: index,
                success: this.deleteUserSuccess,
                error: this.deleteUserError
            }
            this.ajax(config)
        },
        deleteUserSuccess(response, index) {
            this.data.splice(index, 1)
            this.$Notice.success({
                title: response.data.msg
            })
            this.deleteModalShow = false
        },
        deleteUserError(response) {
            var errMsg = this.$t('Error.User.DeleteGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 使用者不存在
                    errMsg += this.$t('Error.UserDelete.Code1')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        deleteConirm(index, userName) {
            this.deleteIndex = parseInt(index)
            this.deleteModalShow = true
            if (userName) this.deleteUserName = userName
        },
        getProfile(id) {
            const config = {
                method: 'post',
                path: '/1/sys/c/user/profile/get/',
                params: this.$t('Error.User.FeaturesGeneral') + '<br>',
                obj: { user_id: id },
                success: this.getProfileSuccess,
                error: this.handleError
            }
            return this.ajax(config)
        },
        getProfileSuccess(response) {
            this.userFeatures = ''
            this.userProfile = ''
            const data = response.data.data
            if (!data) return
            if (data.features)
                this.userFeatures = data.features
            if (data.profile)
                this.userProfile = data.profile
        },
        getUserBaseInfo() {
            const config = {
                method: 'get',
                path: '/1/sys/c/user/all/base/get/',
                params: this.$t('Error.User.GetInfoGeneral') + '<br>',
                success: this.getUserBaseInfoSuccess,
                error: this.handleError
            }
            this.ajax(config)
            if (this.addModal) this.addModal = false
        },
        getUserBaseInfoSuccess(response) {
            this.handlePermission(response.data.data)
            this.dataPool = this.filterData()
            this.handleQuickSearch()
        },
        handleError(response, errMsg = '') {
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleQuickSearch() {
            const arr = []
            this.dataPool.forEach(element => {
                if (element.username.indexOf(this.quickSearchTxt) >= 0)
                    arr.push(element)
            })
            this.errorMsg = ''
            const t = setTimeout(() => {
                if (arr.length === 0)
                    this.errorMsg = this.$t('NoData')
                else this.errorMsg = ''
                clearTimeout(t)
            }, 10)
            this.data = arr
        },
        resetQuickSearch() {
            this.quickSearchTxt = ''
            this.handleQuickSearch()
        },
        handlePermission(inputData) {
            let data = null
            this.superuserLevel = []
            this.AdminLevel = []
            this.userLevel = []
            if (inputData && inputData.length > 0)
                data = this.deepCopy(inputData)
            if (data && data.length > 0) {
                this.superuserLevel = data.filter(item => item.is_superuser)
                this.AdminLevel = data.filter(item => item.username === 'Admin')
                this.userLevel = data.filter(item => !item.is_superuser && item.username !== 'Admin')
            }
        },
        filterData() {
            let data = []
            if (this.$store.state.username === 'atoll') data = [...data, ...this.superuserLevel]
            if (this.$store.state.username === 'Admin' || this.$store.state.username === 'atoll') data = [...data, ...this.AdminLevel]
            data = [...data, ...this.userLevel]
            return data
        }
    }
}
</script>