<template>
    <Modal v-model="addModalShow" class="add-user-modal" width="400">
        <div slot="header" class="fz--large">
            {{`${$t('Add')}${$t('User')}`}}
        </div>
        <Form ref="form"
                class="form"
                label-position="top"
                :model="form"
                :rules="ruleCustom">
            <div class="fz--primary mb-5">{{$t('User') + $t('Name')}}</div>
            <FormItem prop="username">
                <Poptip trigger="focus" placement="right" max-width=600>
                    <Input  v-model="form.username"
                            type="text"
                            long
                            prefix="md-person"
                            class="w-250"
                            :maxlength="150"/>
                    <div slot="content">
                        <i>{{ $t('Tooltips.UserNameAdd') }}</i>
                    </div>
                </Poptip>
            </FormItem>
            <div class="fz--primary mb-5">{{$t('Password')}}</div>
            <FormItem prop="passwd">
                <Poptip trigger="focus" placement="right" max-width=600>
                    <Input  v-model="form.passwd"
                            type="password"
                            prefix="ios-key-outline"
                            class="w-250"/>
                    <div slot="content">
                        <i v-html="$t('Tooltips.UserPwdRule')"></i>
                    </div>
                </Poptip>
            </FormItem>
            <div class="fz--primary mb-5">{{$t('PasswordC')}}</div>
            <FormItem prop="passwdCheck">
                <Poptip trigger="focus" placement="right" max-width=600>
                    <Input  v-model="form.passwdCheck"
                            type="password"
                            prefix="ios-key"
                            class="w-250"/>
                    <div slot="content">
                        <i>{{ $t('Tooltips.UserPwdVerfiy') }}</i>
                    </div>
                </Poptip>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button :size="'large'"
                    :class="'btn btn--outline'"
                    @click.stop="handleReset('form')">
                    {{$t('Reset')}}
            </Button>
            <Button :size="'large'"
                    :class="'btn btn--outline'"
                    @click.stop="addModalShow = false" >
                    {{$t('Cancel')}}
            </Button>
            <Button :loading="apiLoading"
                    :size="'large'"
                    :disabled="!enableAddUser()"
                    :class="'btn'"
                    @click="addUser('form')">
                    {{$t('Add')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
export default {
    name: 'UserAddModal',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        const usernamePass = (rule, value, callback) => {
            this.usernameVerify = true
            const verify = /\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\\|\/|\;|\n|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
            if (value === '') {
                callback(new Error(this.$t('Error.UserName')))
                this.usernameVerify = false
            }
            else if (value.length > 150) {
                callback(new Error(this.$t('Error.UserErrLonger')))
                this.usernameVerify = false
            }
            else if (verify.test(value)) {
                callback(new Error(this.$t('Error.UserErrCharacters')))
                this.usernameVerify = false
            }
            else callback()
        }
        const validatePass = (rule, value, callback) => {
            this.passwdVerify = true
            const verifyChart = /[a-z]/i
            if (value === '') {
                callback(new Error(this.$t('Error.PwdEnter')))
                this.passwdVerify = false
            }
            else if (value.length < 8) {
                callback(new Error(this.$t('Error.PwdCharactersShorter')))
                this.passwdVerify = false
            }
            else if (value.length > 16) {
                callback(new Error(this.$t('Error.PwdCharactersLonger')))
                this.passwdVerify = false
            }
            else if (!verifyChart.test(value)) {
                callback(new Error(this.$t('Error.PwdNumeric')))
                this.passwdVerify = false
            }
            else {
                if (this.form.passwdCheck !== '')
                    this.$refs.form.validateField('passwdCheck')

                callback()
            }
        }
        const validatePassCheck = (rule, value, callback) => {
            this.passwdCheckVerify = true
            if (value === '') {
                callback(new Error(this.$t('Error.PwdAgain')))
                this.passwdCheckVerify = false
            }
            else if (value !== this.form.passwd) {
                callback(new Error(this.$t('Error.PwdConfirmFailed')))
                this.passwdCheckVerify = false
            }
            else callback()
        }

        return {
            form: {
                username: '',
                passwd: '',
                passwdCheck: ''
            },
            ruleCustom: {
                username: [
                    { validator: usernamePass, trigger: 'change' }
                ],
                passwd: [
                    { validator: validatePass, trigger: 'change' }
                ],
                passwdCheck: [
                    { validator: validatePassCheck, trigger: 'change' }
                ]
            },
            usernameVerify: true,
            passwdVerify: true,
            passwdCheckVerify: true,
            // modal, drawer show
            addModalShow: false,
            // api loading
            apiLoading: false
        }
    },
    methods: {
        addUser(name) {
            this.$refs[name].validate(valid => {
                if (!valid)
                    return this.$Message.error('Please correct the errors below.')

                this.apiLoading = true
                const config = {
                    method: 'post',
                    path: '/1/sys/c/user/create/',
                    obj: {
                        username: this.form.username,
                        password: this.form.passwd
                    },
                    success: response => {
                        this.$Message.success(response.data.msg)
                        this.$emit('refresh')
                        this.addModalShow = false
                    },
                    error: this.addUserError,
                    final: () => {
                        this.$refs[name].resetFields()
                        this.apiLoading = false
                    }
                }
                this.ajax(config)
            })
        },
        addUserError(response) {
            let errMsg = this.$t('Error.UserCreate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 使用者已存在
                    errMsg += this.$t('Error.UserCreate.Code1')
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
        handleReset(name) {
            this.$refs[name].resetFields()
        },
        enableAddUser() {
            let verify = true
            if (!this.usernameVerify || !this.passwdVerify || !this.passwdCheckVerify)
                verify = false
            else if (!this.form.username || !this.form.passwd || !this.form.passwdCheck)
                verify = false
            return verify
        }
    },
    watch: {
        value(data) {
            this.addModalShow = data
        },
        addModalShow(data) {
            this.$emit('input', data)
        }
    }
}
</script>