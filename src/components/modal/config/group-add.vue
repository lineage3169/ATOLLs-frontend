<template>
    <Modal v-model="addModal">
        <div slot="header" class="fz--large">
            {{`${$t('Add')}${getGroupsI18n(type)}`}}
        </div>
        <Form @submit.native.prevent ref="form" :model="form" :rules="ruleCustom">
            <FormItem class="form__items" prop="name" :label="getGroupsI18n(type) + $t('Name')">
               <Input   v-model="form.name"
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
        <div slot="footer">
                <Button size="large"
                        class="btn btn--outline w-100"
                        :loading="apiLoading"
                        @click.stop="addModal = false">
                        {{$t('Cancel')}}
                </Button>
                <Button size="large"
                        class="btn w-100"
                        :disabled="disableAdd || !form.name || !form.alias"
                        :loading="apiLoading"
                        @click.stop="createGroup()">
                        {{$t('Add')}}
                </Button>
            </div>
    </Modal>
</template>
<script>
export default {
    name: 'GroupAddModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        const wordsCheck = (rule, value, callback) => {
            this.disableAdd = false
            if (value === '') {
                this.disableAdd = true
                callback(new Error(this.$t('Error.Required')))
            }
            if (this.isASCII(value) === false) {
                this.disableAdd = true
                callback(new Error(this.$t('Error.NotAllowCharacter')))
            }
            callback()
        }
        return {
            addModal: false,
            form: {
                name: '',
                alias: ''
            },
            ruleCustom: {
                name: [
                    { validator: wordsCheck, trigger: 'change' }
                ]
            },
            disableAdd: false,
            apiLoading: false
        }
    },
    methods: {
        createGroup() {
            this.apiLoading = true
            const postObj = {
                name: this.form.name,
                alias: this.form.alias
            }
            const config = {
                method: 'post',
                path: '/1/sys/c/groups/update/',
                obj: postObj,
                success: () => {
                    const successMsg = this.$t('Add') + this.$t('Success')
                    this.$Message.success(successMsg)
                    this.$emit('refresh')
                    this.$refs.form.resetFields()
                    this.addModal = false
                },
                error: this.createGroupError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        createGroupError(response) {
            let errMsg = this.$t('Error.GroupUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 群組名稱與別名為必填項目
                    errMsg += this.$t('Error.GroupUpdate.Code1')
                    break
                case 2:
                    // 未註冊授權碼
                    errMsg += this.$t('Error.GroupUpdate.Code2')
                    break
                case 3:
                    // 不正確的授權碼格式
                    errMsg += this.$t('Error.GroupUpdate.Code3')
                    break
                case 4:
                    // 已達群組限制
                    errMsg += this.$t('Error.GroupUpdate.Code4')
                    break
                case 5:
                    // 重複的名稱或是ID
                    errMsg += this.$t('Error.GroupUpdate.Code5')
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
        }
    },
    watch: {
        value(data) {
            this.addModal = data
        },
        addModal(data) {
            this.$emit('input', data)
        }
    }
}
</script>