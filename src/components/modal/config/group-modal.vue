<template>
    <Modal v-model="groupModal" class="m-data-group" width="600" footer-hide>
            <div slot="header" class="fz--large">
                {{ $t('Edit') + getGroupsI18n(type) }}
            </div>
            <div class="edit-modal-body">
                <div class="user-container">
                    <div class="info">{{ `${$t('User')} (${users.length})`}}</div>
                    <Input v-model="search"
                            class="w-250"
                            clearable
                            search
                            :placeholder="`${$t('Quick')}${$t('Search')}...`"
                            @input="filterData" />
                    <div class="user-list">
                        <div v-for="(item,index) in users"
                            class="user-item"
                            :key="index">
                            {{ item }}
                        </div>
                        <div v-if="!users || users.length === 0"
                            class="error-msg fz--primary">
                            {{ $t('NoData') }}
                        </div>
                    </div>
                </div>
                <div class="form-container">
                    <Form @submit.native.prevent ref="form" :model="form" :rules="ruleCustom">
                        <FormItem class="form__items" :label="getGroupsI18n(type) + $t('Name')" prop="name">
                        <Input v-model="form.name"
                                type="text"
                                class="input"
                                show-word-limit
                                :maxlength="20"
                                :placeholder="$t('PlaceHolder.PleaseTypeASCII')"/>
                        </FormItem>
                        <FormItem class="form__items" :label="getGroupsI18n(type) + $t('Alias')" prop="alias">
                        <Input v-model="form.alias"
                                type="text"
                                class="input"
                                show-word-limit
                                :maxlength="50"
                                :placeholder="$t('PlaceHolder.PleaseTypeAlias', { groups: getGroupsI18n(type) })"/>
                        </FormItem>
                    </Form>

                </div>
            </div>
            <div class="edit-mode-fooer">
                <Button class="btn w-100"
                        :loading="apiLoading"
                        :disabled="disableSave || !form.name || !form.alias"
                        @click.stop="saveData()">
                        {{$t('Save')}}
                </Button>
            </div>
    </Modal>
</template>
<script>
export default {
    name: 'GroupModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        groupInfo: {
            type: Object,
            required: true
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        const wordsCheck = (rule, value, callback) => {
            this.disableSave = false
            if (value === '') {
                this.disableSave = true
                callback(new Error(this.$t('Error.Required')))
            }
            if (this.isASCII(value) === false) {
                this.disableSave = true
                callback(new Error(this.$t('Error.NotAllowCharacter')))
            }
            callback()
        }
        return {
            form: {
                name: '',
                alias: ''
            },
            ruleCustom: {
                name: [
                    { validator: wordsCheck, trigger: 'change' }
                ]
            },
            search: '',
            id: null,
            users: [],
            usersPool: [],
            disableSave: false,
            groupModal: false,
            apiLoading: false
        }
    },
    methods: {
        saveData() {
            this.apiLoading = true
            const postObj = {
                id: this.id,
                name: this.form.name,
                alias: this.form.alias
            }
            const config = {
                method: 'post',
                path: '/1/sys/c/groups/update/',
                obj: postObj,
                success: this.saveDataSuccess,
                error: this.saveDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        saveDataSuccess(response) {
            const successMsg = this.$t('Edit') + this.$t('Success')
            this.$Message.success(successMsg)
            this.$emit('refresh')
            this.$refs.form.resetFields()
            this.groupModal = false
        },
        saveDataError(response) {
            let errMsg = this.$t('Error.GroupUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 群組名稱與別名為必填項目
                    errMsg += this.$t('Error.GroupUpdate.Code1')
                    break
                case 2:
                    // 重複的名稱或是ID
                    errMsg += this.$t('Error.GroupUpdate.Code2')
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
        filterData() {
            this.users = this.usersPool
                .filter(item => item.indexOf(this.search) > -1)
        }
    },
    watch: {
        value(data) {
            this.groupModal = data
        },
        groupModal(data) {
            this.$emit('input', data)
        },
        groupInfo(data) {
            this.form.name = data.name
            this.form.alias = data.alias
            this.usersPool = data.users || []
            this.id = data.id || null
            this.filterData()
        }
    }
}
</script>