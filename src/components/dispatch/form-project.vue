<template>
    <div class="m-form-company">
        <Form ref="formCustom"
            label-position="top"
            :model="formCustom"
            :rules="ruleCustom" >
            <div class="fz--primary mb-5">
                {{$t('Project')+$t('English')+$t('Name')}}
            </div>
            <FormItem prop="name">
                <Input  v-model="formCustom.name"
                        show-word-limit
                        :placeholder="$t('PlaceHolder.PleaseTypeProjectName')"
                        :maxlength="20"/>
            </FormItem>
            <div class="fz--primary mb-5">
                {{$t('Project') + $t('Description')}}
            </div>
            <FormItem prop="description">
                <Input  v-model="formCustom.description"
                        show-word-limit
                        :placeholder="$t('PlaceHolder.AllowChineseAndEnglish')"
                        :maxlength="100"/>
            </FormItem>
        </Form>
        <div slot="footer">
            <div class="d-flex d-flex--justify-end">
                <Button size="large"
                        class="btn btn--outline mr-5"
                        @click="backToEventModal()">
                        {{$t('Back')}}
                </Button>
                <Button size="large"
                        class="btn btn--outline mr-5"
                        @click="handleReset('formCustom')">
                        {{$t('Reset')}}
                </Button>
                <Button size="large"
                        type="primary"
                        class="btn"
                        :disabled="disableSave()"
                        @click="handleSave('formCustom')">
                        {{$t('Save')}}
                </Button>
            </div>
        </div>
        <DeleteConfirm v-model="deleteModalShow"
            :msg="this.formCustom.name"
            :loading="deleteLoading"
            :on-ok="deleteProject"/>
    </div>
</template>
<script>
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'ProjectForm',
    components: { DeleteConfirm },
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    data() {
        const namePass = (rule, value, callback) => {
            const verify = /\.|\,|\||\-|\_|\@|\`|\s|\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\\|\/|\;|\n|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
            this.nameVerify = true
            if (value === '') {
                callback(new Error(this.$t('Unfilled')))
                this.nameVerify = false
            }
            else if (verify.test(value)) {
                callback(new Error(this.$t('Error.NotAllowCharacter')))
                this.nameVerify = false
            }
            else callback()
        }

        return {
            formCustom: {
                id: '',
                name: '',
                description: ''
            },
            ruleCustom: {
                name: [{ validator: namePass, trigger: 'change' }]
            },
            fromStatus: 0,
            // verify
            nameVerify: true,
            // apiLoadin
            apiLoading: false,
            deleteLoading: false,
            // components show
            deleteModalShow: false
        }
    },
    mounted() {
    },
    methods: {
        setData(data) {
            if (!data)
                return
            const item = this.deepCopy(data)
            this.formCustom.id = item.id || ''
            this.formCustom.name = item.name || ''
            this.formCustom.description = item.description || ''
        },
        handleSave(name) {
            this.$refs[name].validate((valid) => {
                if (!valid)
                    return this.$Message.error('Please correct the errors below.')
                this.apiLoading = true
                const obj = {
                    name: this.formCustom.name,
                    description: this.formCustom.description
                }
                if (this.formCustom.id) obj.id = this.formCustom.id
                const config = {
                    method: 'post',
                    path: '/1/ins/c/project/update/',
                    obj: obj,
                    params: obj,
                    success: this.handleSaveSuccess,
                    error: this.handleSaveError,
                    final: this.handleSaveFinal
                }
                this.ajax(config)
            })
        },
        handleSaveSuccess(response, obj) {
            this.$Message.success(this.$t('Save') + this.$t('Success'))
            this.apiLoading = false
            if (obj.id) {
                this.dispatchAppGetData()
                this.fromStatus = 0
            }
        },
        handleSaveError(response) {
            let errMsg = this.$t('Error.Project.UpdateGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)

            this.errorModal(errMsg)
            this.apiLoading = false
        },
        handleSaveFinal() {
            this.$refs.formCustom.resetFields()
            this.apiLoading = false
        },
        handleReset(name) {
            this.$refs[name].resetFields()
            this.formCustom.id = ''
        },
        disableSave() {
            let disable = false
            const obj = this.formCustom
            if (!obj.name || !obj.description) disable = true
            else if (!this.nameVerify) disable = true
            return disable
        },
        backToEventModal() {
            this.fromStatus = 0
        },
        deleteConfirm() {
            this.deleteModalShow = true
        },
        deleteProject() {
            const obj = { id: this.formCustom.id }
            this.deleteLoading = true
            const config = {
                method: 'post',
                path: '/1/ins/c/project/delete/',
                obj: obj,
                params: obj,
                success: this.deleteProjectSuccess,
                error: this.deleteProjectError,
                final: this.deleteProjectFinal
            }
            this.ajax(config)
        },
        deleteProjectSuccess(response, obj) {
            this.$Message.success(this.$t('Delete') + this.$t('Success'))
            this.$parent.$parent.projectList = this.$parent.$parent.projectList
                .filter(item => item.id !== obj.id)
            this.dispatchAppGetData()
            this.handleReset('formCustom')
        },
        deleteProjectError(response) {
            let errMsg = this.$t('Error.Project.DeleteGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 未提供 UUID
                    errMsg += this.$t('Error.UUID')
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
        deleteProjectFinal(response) {
            this.deleteLoading = false
            this.deleteModalShow = false
        },
        dispatchAppGetData() {
            this.$parent.$parent.$parent.getData()
        }
    },
    watch: {
        value(data) {
            this.fromStatus = data
        },
        fromStatus(data) {
            this.$emit('input', data)
            if (data !== 1) this.handleReset('formCustom')
        }
    }
}
</script>