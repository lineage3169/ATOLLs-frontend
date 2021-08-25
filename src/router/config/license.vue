<template>
    <div class="m-system-config bg-color--white">
         <!-- 啟用 -->
        <div class="panal">
            <Spin v-if="licenseLoading" fix/>
            <div class="panal__title">
                {{$t('ActiveB')}}
            </div>
            <!-- 狀態 -->
            <div class="panal__items">
                <div class="panal__items__title">
                    {{$t('Status')}}
                </div>
                <div class="panal__items__content">
                    <template v-if="activeStauts === 'ACTIVE' || activeStauts === 'CHANGE'">
                        {{$t('ActiveC')}}
                    </template>
                    <template v-else>
                        {{$t('Inactive')}}
                    </template>
                </div>
            </div>
            <!-- 產品識別碼 -->
            <div class="panal__items no-border br-5--bottom">
                <div class="panal__items__title">
                    {{$t('LicenseCodes')}}
                </div>
                <div class="panal__items__content">
                    <template v-if="activeStauts === 'ACTIVE'">
                        <span class="mr-30">
                            {{originLicense}}
                        </span>
                    </template>
                    <template v-if="activeStauts === 'INACTIVE' || activeStauts === 'CHANGE'">
                        <i-input v-model="licenseCode1"
                                class="license-code mr-5"
                                id="code_1"
                                :readonly="activeStauts === 'ACTIVE'"
                                :placeholder="'XXXXX'"/>
                        <span>-</span>
                        <i-input v-model="licenseCode2"
                                class="license-code mr-5 ml-5"
                                id="code_2"
                                :maxlength="5"
                                :placeholder="'XXXXX'"/>
                        <span>-</span>
                        <i-input v-model="licenseCode3"
                                class="license-code mr-5 ml-5"
                                id="code_3"
                                :maxlength="5"
                                :placeholder="'XXXXX'"/>
                        <span>-</span>
                        <i-input v-model="licenseCode4"
                                class="license-code ml-5 mr-30"
                                id="code_4"
                                :maxlength="5"
                                :placeholder="'XXXXX'"/>
                    </template>
                    <Button v-if="activeStauts === 'ACTIVE'"
                            class="btn btn--outline"
                            style="height:32px !important;"
                            @click.stop="activeStauts = 'CHANGE'">
                            {{$t('Change') + $t('LicenseCodes')}}
                    </Button>
                    <Button v-if="activeStauts === 'INACTIVE' || activeStauts === 'CHANGE'"
                            class="btn w-100  mr-15"
                            style="height:32px !important;"
                            :disabled="disableActive()"
                            @click.stop="setLicense()">
                            {{$t('ActiveB')}}
                    </Button>
                    <Button v-if="originLicense && activeStauts === 'CHANGE'"
                            class="btn btn--outline w-100"
                            style="height:32px !important;"
                            @click.stop="activeStauts = 'ACTIVE'">
                            {{$t('Cancel')}}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConfigLicnese',
    data() {
        return {
            licenseLoading: false,
            isSystemActive: false,
            // 未啟動 INACTIVE, 啟動 ACTIVE, 更改 CHANGE
            activeStauts: 'INACTIVE',
            originLicense: '',
            licenseCode1: '',
            licenseCode2: '',
            licenseCode3: '',
            licenseCode4: ''
        }
    },
    created() {
        this.getLicenseCode()
    },
    methods: {
        getLicenseCode() {
            this.licenseLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/license/local/get/',
                success: this.getLicenseCodeSuccess,
                error: this.getLicenseCodeError,
                final: () => { this.licenseLoading = false }
            }
            this.ajax(config)
        },
        getLicenseCodeSuccess(response) {
            if (!response.data.data) {
                this.activeStauts = 'INACTIVE'
                return
            }
            this.activeStauts = 'ACTIVE'
            const licenseCode = response.data.data
            if (licenseCode.split('-').length === 4) this.originLicense = licenseCode
        },
        getLicenseCodeError(response) {
            let errMsg = this.$t('Error.License.LocalGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setLicense() {
            this.licenseLoading = true
            const license = `${this.licenseCode1}-${this.licenseCode2}-${this.licenseCode3}-${this.licenseCode4}`
            const config = {
                method: 'post',
                path: '/1/sys/c/license/register/',
                obj: { license_key: license },
                success: () => {
                    const content = `${this.$t('ActiveB')}${this.$t('Success')}`
                    this.$Message.success(content)
                    this.getLicenseCode()
                },
                error: this.setLicenseError,
                final: () => { this.licenseLoading = false }
            }
            this.ajax(config)
        },
        setLicenseError(response) {
            let errMsg = this.$t('Error.License.RegisterGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 不合法的授權碼
                case 1:
                    errMsg += '不合法的授權碼'
                    break
                default:
                    errMsg += `${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        disableActive() {
            let verify = false
            const licenseCode = ['licenseCode1', 'licenseCode2',
                'licenseCode3', 'licenseCode4']
            verify = licenseCode.some(key => this[key].length !== 5)
            return verify
        },
        focusInput(value, index) {
            const id = `code_${index}`
            const ipInput = document.getElementById(id).children[1]
            if (value.length === 5) ipInput.focus()
        }
    },
    watch: {
        lang(str) {
            this.handleLocale(str)
        },
        licenseCode1(codeString) {
            if (!codeString) return
            const codeArr = codeString.split('-')
            if (codeArr.length === 4) {
                this.licenseCode1 = codeArr[0]
                this.licenseCode2 = codeArr[1]
                this.licenseCode3 = codeArr[2]
                this.licenseCode4 = codeArr[3]
            }
            else this.focusInput(codeString, 2)
        },
        licenseCode2(codeString) {
            if (!codeString) return
            this.focusInput(codeString, 3)
        },
        licenseCode3(codeString) {
            if (!codeString) return
            this.focusInput(codeString, 4)
        },
        activeStauts(status) {
            if (status === 'CHANGE') {
                this.licenseCode1 = ''
                this.licenseCode2 = ''
                this.licenseCode3 = ''
                this.licenseCode4 = ''
            }
        }
    }
}
</script>