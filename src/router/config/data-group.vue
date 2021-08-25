<template>
    <div class="p-config">
        <Spin v-show="apiLoading" size="large" fix />
        <div class="tools">
            <Input v-model="search"
                    class="w-250"
                    clearable
                    search
                    :placeholder="`${$t('Quick')}${$t('Search')}...`"
                    @input="filterData" />
            <div v-if="dataPool && dataPool.length > 0" class="records">
                {{ dataPool.length + $t('Records') + $t('Data') }}
            </div>
        </div>
        <div class="groups-container noselect">
            <div class="group__item group__item--add"
                @click.stop="addModalShow = true">
                <div class="add__item">
                    <div class="icon">
                        <Icon type="md-add" />
                    </div>
                    <div class="title">
                        {{ $t('Add') + getGroupsI18n(type) }}
                    </div>
                </div>
            </div>
            <div v-for="(item,index) in groups"
                class="group__item"
                :key="index">
                <div class="group__item__alias">
                    {{ item.alias }}
                </div>
                <div class="group__item__name">
                    {{ item.name }}
                </div>
                <div class="group__item__info">
                    <div v-if="item.users" class="people">
                        <div class="icon">
                            <Icon type="md-people" />
                        </div>
                        <div class="count">
                            {{ item.users.length }}
                        </div>
                    </div>
                </div>
                <div class="group__item__action">
                    <div class="action__item mr-30"
                        @click.stop="editGroup(item)">
                        <div class="icon">
                            <Icon type="md-settings" />
                        </div>
                        <div class="title">
                            {{ $t('Edit') }}
                        </div>
                    </div>
                    <div class="action__item"
                        @click.stop="deleteConfirm(item)">
                        <div class="icon">
                            <Icon type="ios-trash-outline" />
                        </div>
                        <div class="title">
                            {{ $t('Delete') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Edit Group -->
        <GroupModal v-model="editModalShow"
                    :groupInfo="groupInfo"
                    :type="type"
                    @refresh="getGroups"/>
        <!-- Add Group -->
        <GroupAdd v-model="addModalShow"
            :type="type"
            @refresh="getGroups"/>
        <!-- Delete Group -->
        <DeleteConfirm v-model="deleteModalShow"
            :msg="deleteGroupName"
            :loading="deleteLoading"
            :on-ok="deleteGroup"/>
    </div>
</template>

<script>
import GroupModal from '@/components/modal/config/group-modal.vue'
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'ConfigGroupChange',
    props: {
        type: {
            type: String,
            default: ''
        }
    },
    components: {
        GroupModal,
        DeleteConfirm,
        GroupAdd: resolve => require(['@/components/modal/config/group-add.vue'], resolve)
    },
    data() {
        return {
            groupInfo: {},
            search: '',
            deleteGroupName: '',
            deleteItem: null,
            dataPool: [],
            groups: [],
            addModalShow: false,
            deleteModalShow: false,
            editModalShow: false,
            apiLoading: false,
            deleteLoading: false
        }
    },
    created() {
        this.getGroups()
    },
    methods: {
        getGroups() {
            this.dataPool = []
            this.groups = []
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/groups/get/',
                success: response => {
                    if (response.data && response.data.data) {
                        this.dataPool = this.deepCopy(response.data.data)
                        this.filterData()
                    }
                },
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        handleError(response) {
            let errMsg = this.$t('Error.Groups.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        editGroup(item) {
            this.groupInfo = this.deepCopy(item)
            this.editModalShow = true
        },
        deleteConfirm(item) {
            this.deleteGroupName = `${item.alias} (${item.name})`
            this.deleteItem = item
            this.deleteModalShow = true
        },
        deleteGroup() {
            this.deleteLoading = true
            const config = {
                method: 'post',
                path: '/1/sys/c/groups/delete/',
                obj: { id: this.deleteItem.id },
                success: response => {
                    const successMsg = this.$t('Delete') + this.$t('Success')
                    this.$Message.success(successMsg)
                    this.getGroups()
                    this.deleteModalShow = false
                },
                error: this.handleError,
                final: () => { this.deleteLoading = false }
            }
            this.ajax(config)
        },
        filterData() {
            const str = this.search
            this.groups = this.dataPool.filter(item => {
                if (item.name.indexOf(str) > -1 || item.alias.indexOf(str) > -1)
                    return item
            })
        }
    }
}
</script>