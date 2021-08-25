<template>
    <div class="m-form-company">
        <Form ref="formCustom"
            label-position="top"
            :model="formCustom"
            :rules="ruleCustom">
            <div class="fz--primary mb-5">
                {{$t('English')+$t('Abbreviation')}}
            </div>
            <FormItem prop="name">
                <Input  v-model="formCustom.name"
                        show-word-limit
                        :placeholder="$t('PlaceHolder.PleaseTypeAbbreviation')"
                        :maxlength="10"
                        @on-change="setStrUpperCase('name')"/>
            </FormItem>
            <div class="fz--primary mb-5">
                {{$t('Company')+$t('Alias')}}
            </div>
            <FormItem prop="alias">
                <Input  v-model="formCustom.alias"
                        show-word-limit
                        :placeholder="$t('PlaceHolder.AllowChineseAndEnglish')"
                        :maxlength="50"/>
            </FormItem>
            <div class="fz--primary mb-5">
                IP {{$t('AddressA')}}
            </div>
            <FormItem prop="ip_address">
                <InputNumber v-model="formCustom.ip_address[0]"
                            class="ip-address"
                            ref="ip1"
                            placeholder="127"
                            :max="255"
                            :min="0"/>
                <span class="dot">.</span>
                <InputNumber v-model="formCustom.ip_address[1]"
                            class="ip-address"
                            ref="ip2"
                            id="ip2"
                            placeholder="0"
                            :max="255"
                            :min="0"/>
                <span class="dot">.</span>
                <InputNumber v-model="formCustom.ip_address[2]"
                            class="ip-address"
                            ref="ip3"
                            id="ip3"
                            placeholder="0"
                            :max="255"
                            :min="0"/>
                <span class="dot">.</span>
                <InputNumber v-model="formCustom.ip_address[3]"
                            class="ip-address"
                            ref="ip4"
                            id="ip4"
                            placeholder="1"
                            :max="255"
                            :min="0"/>
            </FormItem>
            <div class="fz--primary mb-5">
                {{$t('Upload') + $t('Path')}}
            </div>
            <FormItem prop="upload_path">
                <Input  v-model="formCustom.upload_path"
                        placeholder="upload/path"
                        show-word-limit
                        :maxlength="100" />
            </FormItem>
            <div class="fz--primary mb-5">
                {{$t('Download') + $t('Path')}}
            </div>
            <FormItem prop="download_path">
                <Input  v-model="formCustom.download_path"
                        placeholder="download/path"
                        show-word-limit
                        :maxlength="100" />
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
                        :loading="apiLoading"
                        @click="handleSave('formCustom')">
                        {{$t('Save')}}
                </Button>
            </div>
        </div>
        <DeleteConfirm v-model="deleteModalShow"
            :msg="`${this.formCustom.name} - ${this.formCustom.alias}`"
            :loading="deleteLoading"
            :on-ok="deleteCompany"/>
    </div>
</template>
<script>
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'CompanyForm',
    components: { DeleteConfirm },
    props: {
        value: {
            type: Number,
            default: 0
        }
    },
    data() {
        const namePass = (rule, value, callback) => {
            const verify = /\.|\,|\||\-|\_|\@|\`|\s|[0-9]|\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\\|\/|\;|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
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
        const aliasPass = (rule, value, callback) => {
            this.aliasVerify = true
            if (value === '') {
                callback(new Error(this.$t('Unfilled')))
                this.aliasVerify = false
            }
            else callback()
        }
        const ipAddressPass = (rule, value, callback) => {
            this.ipAddressVerify = true
            if (value.filter(el => { return el === null }).length > 0) {
                callback(new Error(this.$t('Unfilled')))
                this.ipAddressVerify = false
            }
            else callback()
        }
        const uploadPathPass = (rule, value, callback) => {
            const verify = /\.|\,|\||\@|\`|\s|\\|\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\;|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
            this.uploadVerify = true
            if (value === '') {
                callback(new Error(this.$t('Unfilled')))
                this.uploadVerify = false
            }
            else if (verify.test(value)) {
                callback(new Error(this.$t('Error.NotAllowCharacter')))
                this.uploadVerify = false
            }
            else callback()
        }
        const downloadPathPass = (rule, value, callback) => {
            const verify = /\.|\,|\||\@|\`|\s|\\|\~|\!|\#|\$|\%|\^|\&|\*|\(|\)|\=|\+|\[|\]|\:|\{|\}|\'|\"|\?|\<|\>|\;|[\u4e00-\u9fa5]|[\uFE30-\uFFA0]|[\uFF00-\uFFFF]|[\u0800-\u4E00]|[\u9fa5-\uFFFF]/
            this.downloadVerify = true
            if (value === '') {
                callback(new Error(this.$t('Unfilled')))
                this.downloadVerify = false
            }
            else if (verify.test(value)) {
                callback(new Error(this.$t('Error.NotAllowCharacter')))
                this.downloadVerify = false
            }
            else callback()
        }

        return {
            formCustom: {
                id: '',
                name: '',
                alias: '',
                ip_address: [null, null, null, null],
                upload_path: '',
                download_path: ''
            },
            ruleCustom: {
                name: [{ validator: namePass, trigger: 'change' }],
                alias: [{ validator: aliasPass, trigger: 'change' }],
                ip_address: [{ validator: ipAddressPass, trigger: 'change' }],
                upload_path: [{ validator: uploadPathPass, trigger: 'change' }],
                download_path: [{ validator: downloadPathPass, trigger: 'change' }]
            },
            fromStatus: 0,
            // verify
            nameVerify: true,
            aliasVerify: true,
            ipAddressVerify: true,
            uploadVerify: true,
            downloadVerify: true,
            // apiLoading
            apiLoading: false,
            deleteLoading: false,
            // components show
            deleteModalShow: false
        }
    },
    methods: {
        setData(data) {
            if (!data)
                return
            const item = this.deepCopy(data)
            this.formCustom.id = item.id || ''
            this.formCustom.name = item.name || ''
            this.formCustom.alias = item.alias || ''
            this.formCustom.ip_address = this.transStringToIp(item.ip_address) || [null, null, null, null]
            this.formCustom.upload_path = item.upload_path || ''
            this.formCustom.download_path = item.download_path || ''
        },
        setStrUpperCase(key) {
            this.formCustom[key] = this.formCustom[key].toUpperCase()
        },
        handleReset(name) {
            this.$refs[name].resetFields()
            this.formCustom.ip_address = [null, null, null, null]
            this.formCustom.id = ''
        },
        handleSave(name) {
            this.$refs[name].validate((valid) => {
                if (!valid)
                    return this.$Message.error('Please correct the errors below.')
                this.apiLoading = true

                const obj = {
                    name: this.formCustom.name,
                    alias: this.formCustom.alias,
                    ip_address: this.transIPtoString(this.formCustom.ip_address),
                    upload_path: this.formCustom.upload_path,
                    download_path: this.formCustom.download_path,
                    proportion: 0
                }
                if (this.formCustom.id)
                    obj.id = this.formCustom.id
                const config = {
                    method: 'post',
                    path: '/1/ins/c/outsourcing/update/',
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
            if (obj.id) {
                this.dispatchAppGetData()
                this.fromStatus = 0
            }
        },
        handleSaveError(response) {
            let errMsg = this.$t('Error.Company.UpdateGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleSaveFinal(response) {
            this.$refs.formCustom.resetFields()
            this.formCustom.ip_address = [null, null, null, null]
            this.apiLoading = false
        },
        disableSave() {
            let disable = false
            const obj = this.formCustom
            if (!obj.name || !obj.alias || !obj.upload_path || !obj.download_path)
                disable = true
            else if (obj.ip_address.filter(el => el === null).length > 0)
                disable = true
            else if (!this.nameVerify || !this.aliasVerify ||
                !this.ipAddressVerify || !this.uploadVerify ||
                !this.downloadVerify)
                disable = true
            return disable
        },
        transIPtoString(arr) {
            return arr.join('.')
        },
        transStringToIp(str) {
            return str.split('.').map(item => parseInt(item))
        },
        transTOJSON(arr) {
            const postData = {}
            postData.info = {}
            postData.info.data = arr
            return JSON.stringify(postData)
        },
        focusInput(value, index) {
            const id = `ip${index}`
            const ipInput = document.getElementById(id).children[1].children[0]
            if (value.length === 3) ipInput.focus()
        },
        backToEventModal() {
            this.fromStatus = 0
        },
        deleteConfirm() {
            this.deleteModalShow = true
        },
        deleteCompany() {
            const obj = { id: this.formCustom.id }
            this.deleteLoading = true
            const config = {
                method: 'post',
                path: '/1/ins/c/outsourcing/delete/',
                obj: obj,
                params: obj,
                success: this.deleteCompanySuccess,
                error: this.deleteCompanyError,
                final: this.deleteCompanyFinal
            }
            this.ajax(config)
        },
        deleteCompanySuccess(response, obj) {
            this.$Message.success(this.$t('Delete') + this.$t('Success'))
            this.$parent.$parent.companyList = this.$parent.$parent.companyList
                .filter(item => item.id !== obj.id)
            this.dispatchAppGetData()
            this.handleReset('formCustom')
        },
        deleteCompanyError(response) {
            let errMsg = this.$t('Error.Company.DeleteGeneral') + '<br>'
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
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        deleteCompanyFinal(response) {
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
            if (data !== 2) this.handleReset('formCustom')
        },
        'formCustom.ip_address.0': function(val, oldVal) {
            const ipValue = val ? val.toString() : ''
            this.focusInput(ipValue, '2')
        },
        'formCustom.ip_address.1': function(val, oldVal) {
            const ipValue = val ? val.toString() : ''
            this.focusInput(ipValue, '3')
        },
        'formCustom.ip_address.2': function(val, oldVal) {
            const ipValue = val ? val.toString() : ''
            this.focusInput(ipValue, '4')
        }
    }
}
</script>