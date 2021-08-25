<template>
    <Modal v-model="showModal"
           width="800px"
           :styles="{top: '20px'}"
           :class-name="'m-config-notice-group-modal'">
        <h1 slot="header" class="fz--large">
            {{ modalTitle() }}
        </h1>
        <!-- 群組資訊 -->
        <div class="form">
            <div class="form__items">
                    <div class="form__items__label">
                        {{`${$t('Groups')}${$t('Name')}`}}
                    </div>
                    <i-input v-model="groupName"
                             class="form__items__input form__items__input--check"
                             maxlength="20"
                             show-word-limit
                             :class="{'ivu-form-item-error':isNameRepeated || isNameVerifyFalid}"
                             @on-change="checkGroupName"/>
                    <div class="check-name-status"
                         :class="{ 'check-name-status--error': isNameRepeated || isNameVerifyFalid,
                                   'check-name-status--success': !isNameRepeated && !isNameVerifyFalid}">
                        <template v-if="groupName.length > 0">
                            <Icon v-if="!isNameRepeated && !isNameVerifyFalid" type="md-checkmark-circle-outline" />
                            <Icon v-if="isNameRepeated || isNameVerifyFalid" type="md-close-circle" />
                        </template>
                    </div>
                    <div class="form__error-msg" >
                        <template v-if="isNameVerifyFalid">
                            <div>
                                {{ $t('Error.NotAllowCharacter') }}
                            </div>
                        </template>
                    </div>
                    <!-- <div class="form__items__label mt-10" >
                        {{this.$t('NoticeA') + this.$t('Method')}}
                    </div>
                    <Select v-model="noticeMethod">
                        <Option v-for="(item,index) in methodList"
                                :value="item.value"
                                :key="index"
                                :label="item.label"/>
                    </Select> -->
                </div>
            <Transfer :data="allUser"
                      :target-keys="targetKeys"
                      :titles="transTitle"
                      @on-change="handleChange" />
        </div>
        <div slot="footer">
            <Button class="btn btn--outline fz--primary"
                    @click.stop="showModal = false">
                    {{`${$t('Cancel')}`}}
            </Button>
            <Button class="btn fz--primary"
                    :loading="apiLoading"
                    :disabled="disableSave()"
                    @click.stop="handleSave()">
                    {{ saveText() }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'NoticeGorupModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        groupData: {
            type: Object,
            required: false
        },
        allGroupData: {
            type: Array,
            required: true
        },
        allUserData: {
            type: Array,
            required: true
        },
        modalType: {
            type: String,
            required: true
        }
    },
    data() {
        const noticeMap = this.$store.state.noticeMap

        return {
            apiLoading: false,
            showModal: false,
            isNameRepeated: false,
            isNameVerifyFalid: false,
            groupId: null,
            noticeMethod: 1,
            groupName: '',
            type: 'ADD',
            user: [],
            allUser: [],
            targetKeys: [],
            transTitle: [this.$t('User'), this.$t('ChosenA')],
            methodList: [
                {
                    value: 0,
                    label: noticeMap[0] // 將通知記錄在檔案上
                },
                {
                    value: 1,
                    label: noticeMap[1] // 由電子郵件傳送
                },
                {
                    value: 2,
                    label: noticeMap[2] // 由簡訊傳送
                },
                {
                    value: 3,
                    label: noticeMap[3] // 由即時通訊傳送
                },
                {
                    value: 4,
                    label: noticeMap[4] // 由網頁傳送通知
                }
            ]
        }
    },
    methods: {
        async handleSave() {
            await this.setGroup()
            if (this.type === 'ADD')
                await this.getGroupData()
            await this.setGroupUser()
        },
        getGroupData() {
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
            if (!response.data.data || response.data.data.legnth === 0)
                return
            const data = this.deepCopy(response.data.data)
            this.groupId = data.filter(item => item.name === this.groupName)
                .map(item => item.id)[0]
        },
        setGroup() {
            if (!this.groupName)
                return
            this.apiLoading = true
            const postObj = {
                id: this.groupId,
                name: this.groupName,
                method: this.noticeMethod
            }
            const config = {
                method: 'post',
                obj: postObj,
                path: '/1/sys/c/groups/notice/update/',
                params: this.$t('Error.Groups.UpdateGeneral') + '<br>',
                success: this.setGroupSuccess,
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        setGroupSuccess() {
            let content = ''
            if (this.type === 'ADD')
                content = this.$t('Add') + this.$t('Success')
            if (this.type === 'EDIT')
                content = this.$t('Edit') + this.$t('Success')
            this.$Message.success(content)
            this.showModal = false
        },
        setGroupUser() {
            if (!this.groupId)
                return
            this.apiLoading = true
            const postObj = {
                group_id: this.groupId,
                users: this.targetKeys.join(',')
            }
            const config = {
                method: 'post',
                obj: postObj,
                path: '/1/sys/c/groups/notice/users/update/',
                params: this.$t('Error.GroupsUser.UpdateGeneral') + '<br>',
                success: () => { this.$emit('refresh') },
                error: this.handleError,
                final: () => {
                    this.apiLoading = false
                    this.showModal = false
                }
            }
            this.ajax(config)
        },
        handleChange(newTargetKeys) {
            this.targetKeys = newTargetKeys
        },
        resetData() {
            this.noticeMethod = 1
            this.groupId = null
            this.groupName = ''
            this.targetKeys = []
        },
        disableSave() {
            if (!this.groupName) return true
            if (this.isNameRepeated) return true
            if (this.isNameVerifyFalid) return true
            return false
        },
        handleError(response, msg = '') {
            let errMsg = msg
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        checkGroupName() {
            this.isNameRepeated = true
            this.isNameVerifyFalid = false
            const nameVerify = /\.|\,|\||\-|\_|\@|\`|\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\\|\/|\;|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
            const allGroupsName = this.allGroupData.map(item => item.name.toLowerCase())
            const groupName = this.groupName.toLowerCase()
            const isEdit = this.groupData && this.groupData.name
            this.isNameRepeated = allGroupsName.indexOf(groupName) > -1
            if (isEdit && groupName === this.groupData.name.toLowerCase())
                this.isNameRepeated = false
            this.isNameVerifyFalid = nameVerify.test(groupName)
        },
        modalTitle() {
            if (this.type === 'ADD')
                return this.$t('Add') + this.$t('Groups')
            if (this.type === 'EDIT')
                return this.$t('Change') + this.$t('Groups')
        },
        saveText() {
            if (this.type === 'ADD') return this.$t('Add')
            if (this.type === 'EDIT') return this.$t('Save')
        }
    },
    watch: {
        value(data) {
            this.showModal = data
        },
        showModal(data) {
            this.$emit('input', data)
        },
        groupData(data) {
            if (!data || Object.keys(data).length === 0)
                return
            this.groupId = data.id
            if (data.user)
                this.targetKeys = data.user.map(item => item.user_id)
            this.groupName = data.name
            // this.noticeMethod = data.method
        },
        allUserData(data) {
            if (!data)
                return
            const arr = []
            data.forEach(item => {
                const obj = {
                    key: item.id,
                    label: item.username
                }
                arr.push(obj)
            })
            this.allUser = arr
        },
        modalType(type) {
            if (type === 'ADD' || type === 'EDIT')
                this.type = type
        },
        type(data) {
            if (data === 'ADD') this.resetData()
        }
    }
}
</script>