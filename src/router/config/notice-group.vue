<template>
    <div class="m-config-notice-group">
        <Spin v-if="apiLoading" size="large" fix/>
        <div class="tools">
            <div class="tools-left">
                <div class="tools-left__search">
                    <input  v-model="searchText"
                            type="text"
                            :placeholder="`${$t('Quick')}${$t('Search')}...`"
                            @input="handleQuickSearch">
                    <div class="tools__left__search__icon" @click.stop="resetQuickSearch">
                        <Icon type="ios-close-circle-outline"/>
                    </div>
                </div>
            </div>
            <div class="tools-right">
                <Button class="btn btn--long fz--primary"
                        type="primary"
                        @click.stop="handleAdd()">
                    {{`${$t('Add')}${$t('Groups')}`}}
                </Button>
            </div>

        </div>
        <div class="list">
            <template v-for="(item, index) in data" >
                <div class="list-items" :key="index">
                    <div class="list-items--top">
                        <div class="list-items__group-name">
                            {{`${item.name} (${item.userCounts})`}}
                        </div>
                    </div>
                    <div class="list-items--bottom">
                        <div class="list-items__method">
                            {{noticeMap[item.method]}}
                        </div>
                        <div class="list-items__users">
                            {{item.userString}}
                        </div>
                    </div>
                    <transition name="fade">
                        <div class="list-items__menu">
                            <div class="list-items__menu__container">
                                <div class="list-items__menu__items"
                                     @click.stop="handleEdit(item)">
                                    <div class="list-items__menu__items__icon">
                                        <Icon type="md-settings" />
                                    </div>
                                    <div class="list-items__menu__items__title">
                                        {{$t('Change')}}
                                    </div>
                                </div>
                                <div class="list-items__menu__items"
                                     @click.stop="deleteConfirm(item)">
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
        <!-- Add / Edit Modal -->
        <GroupNoticeModal v-model="groupNoticeModal"
                          :modal-type="modalType"
                          :group-data="selectedGroup"
                          :all-group-data="dataPool"
                          :all-user-data="allUserData"
                          @refresh="initData"/>
        <!-- Delete Modal -->
        <DeleteConfirm v-model="deleteModal"
                        :msg="deleteGroupItem.name"
                        :loading="deleteApiLoading"
                        :on-ok="deleteGroup"/>
    </div>
</template>
<script>
import GroupNoticeModal from '@/components/modal/config/notice-group.vue'
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'ConfigGroupNotice',
    components: { GroupNoticeModal, DeleteConfirm },
    data() {
        return {
            searchText: '',
            errorMsg: '',
            deleteGroupItem: {},
            data: [],
            dataPool: [],
            groupData: [],
            groupUserData: [],
            allUserData: [],
            selectedGroup: {},
            apiLoading: false,
            deleteApiLoading: false,
            groupNoticeModal: false,
            groupNoticeAdd: false,
            deleteModal: false,
            modalType: 'ADD',
            noticeMap: this.$store.state.noticeMap
        }
    },
    created() {
        this.initData()
    },
    methods: {
        async initData() {
            await this.getAllUserData()
            await this.getGroupData()
            await this.getGroupUserData()
            this.dataPool = this.setData()
            this.data = this.setData()
        },
        getGroupData() {
            this.resetData()
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/groups/notice/get/',
                params: this.$t('Error.Groups.GetGeneral') + '<br>',
                success: this.getGroupDataSuccess,
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        getGroupDataSuccess(response) {
            if (!response.data.data || response.data.data.length === 0) {
                this.errorMsg = this.$t('NoData')
                return
            }
            this.groupData = this.deepCopy(response.data.data)
        },
        async getGroupUserData() {
            if (!this.groupData || this.groupData.length === 0)
                return
            this.apiLoading = true
            const userData = []
            for (let i = 0; i < this.groupData.length; i++) {
                const gorupId = this.groupData[i].id
                const groupObj = { group_id: gorupId, users: [] }
                userData.push(groupObj)
                const config = {
                    method: 'get',
                    path: '/1/sys/c/groups/notice/users/get/',
                    obj: { group_id: gorupId },
                    params: this.$t('Error.User.GetInfoGeneral') + '<br>',
                    success: response => {
                        userData[i].users = this.setUserData(response)
                    },
                    error: this.handleError
                }
                await this.ajax(config)
            }
            this.groupUserData = userData
            this.apiLoading = false
        },
        setUserData(response) {
            if (!response.data.data || response.data.data.length === 0) return []
            return this.deepCopy(response.data.data)
        },
        getAllUserData() {
            const config = {
                method: 'get',
                path: '/1/sys/c/user/all/base/get/',
                params: this.$t('Error.User.GetInfoGeneral') + '<br>',
                success: this.getAllUserDataSuccess,
                error: this.handleError
            }
            this.ajax(config)
        },
        getAllUserDataSuccess(response) {
            if (!response.data.data || response.data.data.length === 0) {
                this.allUserData = []
                return
            }
            this.allUserData = response.data.data
        },
        setData() {
            const data = this.deepCopy(this.groupData)
            this.groupUserData.forEach(item => {
                const index = data.findIndex(el => el.id === item.group_id)
                let usersString = item.users.slice(0, 10).map(el => el.user_name).join(', ') || ''
                data[index].userCounts = item.users.length
                if (item.users.length > 10) usersString += ' ...'
                data[index].userString = usersString
                data[index].user = item.users
            })
            return data
        },
        handleQuickSearch() {
            this.data = this.dataPool
                .filter(item => item.name.indexOf(this.searchText) > -1)
            if (this.data.length === 0)
                this.errorMsg = this.$t('NoData')
            else this.errorMsg = ''
        },
        resetQuickSearch() {
            this.data = this.dataPool
            this.errorMsg = ''
            this.searchText = ''
        },
        resetData() {
            this.groupData = []
            this.groupUserData = []
            this.data = []
        },
        handleEdit(item) {
            this.selectedGroup = item
            this.modalType = 'EDIT'
            this.groupNoticeModal = true
        },
        handleAdd() {
            this.modalType = 'ADD'
            this.groupNoticeModal = true
        },
        deleteConfirm(item) {
            this.deleteGroupItem = {
                id: item.id,
                name: item.name
            }
            this.deleteModal = true
        },
        deleteGroup() {
            this.deleteApiLoading = true
            const postObj = {
                id: this.deleteGroupItem.id
            }
            const config = {
                method: 'post',
                obj: postObj,
                path: '/1/sys/c/groups/notice/delete/',
                params: this.$t('Error.Groups.DeleteGeneral') + '<br>',
                success: this.deleteGroupSuccess,
                error: this.handleError,
                final: () => {
                    this.deleteApiLoading = false
                    this.deleteModal = false
                }
            }
            return this.ajax(config)
        },
        deleteGroupSuccess() {
            this.dataPool = this.dataPool.filter(item => item.id !== this.deleteGroupItem.id)
            this.data = this.dataPool
            this.searchText = ''
            this.errorMsg = ''
            if (this.data.length === 0) this.errorMsg = this.$t('NoData')
        },
        handleError(response, errMsg = '') {
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        }
    },
    watch: {
        groupNoticeModal(data) {
            if (data === false) this.selectedGroup = {}
        }
    }
}
</script>