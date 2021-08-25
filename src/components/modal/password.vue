<template>
<Modal v-model="pwdModal" width="350" :footer-hide="true">
    <div slot="header" class="fz--large">
        {{$t('Change')+$t('Password')}}
    </div>
    <div class="m-password">
        <Form ref="formCustom"
            label-position="top"
            :model="formCustom"
            :rules="ruleCustom">
            <template v-if="force === false">
                <div class="fz--primary">
                    {{$t('Old')+$t('Password')}}
                </div>
                <FormItem prop="passwdOld">
                        <Input  v-model="formCustom.passwdOld"
                                class="w-250"
                                type="password"
                                prefix="ios-key-outline"/>
                </FormItem>
            </template>
            <div class="fz--primary">
                {{$t('New')+$t('Password')}}
            </div>
            <FormItem prop="passwd">
                <Tooltip  placement="right">
                    <Input  v-model="formCustom.passwd"
                            type="password"
                            prefix="ios-key-outline"
                            class="w-250"/>
                    <div slot="content">
                        <i v-html="$t('Tooltips.UserPwdRule')"></i>
                    </div>
                </Tooltip >
            </FormItem>
            <template v-if="force === false">
                <div class="fz--primary">
                    {{$t('PasswordC')}}
                </div>
                <FormItem prop="passwdCheck">
                    <Tooltip placement="right">
                        <Input  v-model="formCustom.passwdCheck"
                                type="password"
                                prefix="ios-key"
                                class="w-250"/>
                        <div slot="content">
                            <i>{{ $t('Tooltips.UserPwdVerfiy') }}</i>
                        </div>
                    </Tooltip>
                </FormItem>
            </template>
        </Form>
        <div class="btn-container mt-25">
            <Button size="large"
                    class="btn btn--outline mr-5"
                    @click.stop="handleReset('formCustom')">
                    {{$t('Reset')}}
            </Button>
            <Button size="large"
                    type="primary"
                    class="btn ml-8"
                    :disabled="disableSave()"
                    :loading="apiLoading"
                    @click.stop="confirm()">
                    {{$t('Save')}}
            </Button>
        </div>
    </div>
</Modal>
</template>

<script>
export default {
    name: 'Password',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        force: {
            type: Boolean,
            default: false
        },
        userId: {
            type: Number,
            default: -1
        }
    },
    data() {
        const validatePass = (rule, value, callback) => {
            const verifyChart = /[a-z]/i
            this.pwdVerify = true
            if (value === '') {
                callback(new Error(this.$t('Error.PwdEnter')))
                this.pwdVerify = false
            }
            else if (value.length < 8) {
                callback(new Error(this.$t('Error.PwdCharactersShorter')))
                this.pwdVerify = false
            }
            else if (value.length > 16) {
                callback(new Error(this.$t('Error.PwdCharactersLonger')))
                this.pwdVerify = false
            }
            else if (!verifyChart.test(value)) {
                callback(new Error(this.$t('Error.PwdNumeric')))
                this.pwdVerify = false
            }
            else {
                if (this.formCustom.passwdCheck !== '') {
                    this.$refs.formCustom.validateField('passwdCheck')
                    this.pwdVerify = false
                }
                callback()
            }
        }
        const validatePassCheck = (rule, value, callback) => {
            this.pwdVerify = true
            if (value === '') {
                callback(new Error(this.$t('Error.PwdAgain')))
                this.pwdVerify = false
            }
            else {
                if (value !== this.formCustom.passwd) {
                    callback(new Error(this.$t('Error.PwdConfirmFailed')))
                    this.pwdVerify = false
                }
                callback()
            }
        }

        return {
            formCustom: {
                passwd: '',
                passwdCheck: '',
                passwdOld: ''
            },
            ruleCustom: {
                passwd: [
                    { validator: validatePass, trigger: 'change' }
                ],
                passwdCheck: [
                    { validator: validatePassCheck, trigger: 'change' }
                ]
            },
            pwdVerify: true,
            apiLoading: false,
            pwdModal: false
        }
    },
    methods: {
        handleSave(name) {
            this.$refs[name].validate(valid => {
                if (!valid)
                    return this.$Message.error('Please correct the errors below.')
                this.apiLoading = true
                const postObj = {
                    username: this.$store.state.username,
                    currentpassword: this.formCustom.passwdOld,
                    newpassword: this.formCustom.passwd,
                    confirmpassword: this.formCustom.passwdCheck
                }
                const config = {
                    method: 'post',
                    path: '/1/sys/c/user/password/update/',
                    obj: postObj,
                    success: this.handleSaveSuccess,
                    error: this.handleSaveError,
                    final: () => {
                        this.$refs[name].resetFields()
                        this.apiLoading = false
                    }
                }
                this.ajax(config)
            })
        },
        handleSaveSuccess(response) {
            this.$Message.success(response.data.msg)
            this.pwdModal = false
        },
        handleSaveError(response) {
            let errMsg = this.$t('Error.Password.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 密碼錯誤
                    errMsg += this.$t('Error.UserPasswordChange.Code1')
                    break
                case 2:
                    // 確認密碼與新密碼不符
                    errMsg += this.$t('Error.UserPasswordChange.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        handleReset(name) {
            this.$refs[name].resetFields()
        },
        disableSave() {
            const notForce = this.force === false
            if (!this.pwdVerify) return true
            if (!this.formCustom.passwd) return true
            if (!this.formCustom.passwdCheck && notForce) return true
            if (!this.formCustom.passwdOld && notForce) return true
            return false
        },
        confirm() {
            if (this.force) {
                const confirm = this.$t('Confirm')
                const change = this.$t('Change')
                const password = this.$t('Password')
                this.$Modal.confirm({
                    title: this.$t('WARNING'),
                    content: `${confirm}${change}${password}`,
                    okText: this.$t('OK'),
                    onOk: () => { this.forceSave('formCustom') }
                })
            }
            else this.handleSave('formCustom')
        },
        forceSave(name) {
            this.$refs[name].validate(valid => {
                if (!valid)
                    return this.$Message.error('Please correct the errors below.')
                if (this.userId === -1)
                    return
                this.apiLoading = true
                const postObj = {
                    user_id: this.userId,
                    newpassword: this.formCustom.passwd
                }
                const config = {
                    method: 'post',
                    path: '/1/sys/c/user/password/update/forcibly/',
                    obj: postObj,
                    success: this.handleSaveSuccess,
                    error: this.forceSaveError,
                    final: () => {
                        this.$refs[name].resetFields()
                        this.apiLoading = false
                    }
                }
                this.ajax(config)
            })
        },
        forceSaveError(response) {
            let errMsg = this.$t('Error.Password.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 權限被拒絕
                    errMsg += this.$t('Error.ChangePwdForce.Code1')
                    break
                case 2:
                    // 使用者不存在
                    errMsg += this.$t('Error.ChangePwdForce.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Message.error(errMsg)
        }
    },
    watch: {
        value(data) {
            this.pwdModal = data
        },
        pwdModal(data) {
            this.$emit('input', data)
        }
    }
}
</script>