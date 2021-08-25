<template>
    <div class="m-system-config account"
        :class="{ 'mobile-config view': type === 'PM'}">
        <Header v-if="type === 'PM'"
            :title="$t('Config')"
            :prev="'vehicle/maintenance'"
            :next="'vehicle/create'"/>
        <div class="content__view">
            <div class="l-view">
                <div class="panal">
                    <div class="panal__title noselect">
                        {{$t('Account')+$t('Information')}}
                    </div>
                    <div class="panal__items">
                        <div class="panal__items__title noselect">
                            {{$t('User')+$t('Name')}}
                        </div>
                        <div class="panal__items__content" :class="{'unfilled':!user}">
                            {{infoDisplay(user)}}
                        </div>
                    </div>

                    <div class="panal__items">
                        <div class="panal__items__title noselect">
                            {{$t('FirstName')}}
                        </div>
                        <div class="panal__items__content" :class="{'unfilled':!firstName}">
                            {{ infoDisplay(firstName) }}
                        </div>
                    </div>
                    <div class="panal__items">
                        <div class="panal__items__title noselect">
                            {{$t('LastName')}}
                        </div>
                        <div class="panal__items__content" :class="{'unfilled':!lastName}">
                            {{ infoDisplay(lastName) }}
                        </div>
                    </div>
                    <div class="panal__items">
                        <div class="panal__items__title">
                            {{$t('EMail')}}
                        </div>
                        <div class="panal__items__content" :class="{'unfilled':!email}">
                            {{infoDisplay(email)}}
                        </div>
                    </div>
                    <!-- 變更密碼 -->
                    <div class="panal__items cur-point no-border br-5--bottom" @click.stop="pwdModal = true">
                        <div class="panal__items__title">
                            {{$t('Change')+$t('Password')}}
                        </div>
                        <div class="panal__items__content">
                            <div class="panal__items__set-btn">
                                <div class="panal__items__set-btn__icon">
                                    <Icon size="30" type="ios-arrow-forward" />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="panal">
                    <Spin v-show="apiLoading" size="large" fix/>
                    <div class="panal__title">
                        {{$t('Account')+$t('Config')}}
                    </div>
                    <!-- 語系 -->
                    <div class="panal__items"
                        :class="{ 'no-border br-5--bottom' : type === 'INS'}">
                        <div class="panal__items__title">
                             {{$t('Language')}}
                        </div>
                        <div class="panal__items__content">
                            <RadioGroup v-model="lang">
                                <Radio label="zh_tw">
                                    <span class="mr-15 fz--primary">中文</span>
                                </Radio>
                                <Radio label="en_us">
                                    <span class="fz--primary">English</span>
                                </Radio>
                            </RadioGroup>
                        </div>
                    </div>
                    <!-- 相機掃描 -->
                    <div v-if="type === 'PM'"
                        class="panal__items no-border br-5--bottom">
                        <div class="panal__items__title">
                            {{ `${$t('Camera')}${$t('Scan')}` }}
                        </div>
                        <div class="panal__items__content">
                            <i-switch v-model="cameraScan"
                                @on-change="setCamera"/>
                        </div>
                    </div>
                </div>
            </div>
            <changePassword v-model="pwdModal"/>
            <TheFooter v-if="type !== 'PM'"/>
        </div>
    </div>
</template>

<script>
import changePassword from '@/components/modal/password.vue'
export default {
    name: 'Account',
    props: {
        type: {
            type: String,
            default: ''
        }
    },
    components: {
        changePassword,
        Header: resolve => require(['@/components/m-header.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            user: null,
            email: null,
            firstName: null,
            lastName: null,
            outsourcing: '',
            lang: this.langInit(),
            apiLoading: false,
            pwdModal: false,
            cameraScan: false,
            profile: {}
        }
    },
    created() {
        this.getProfile()
        this.user = this.$store.state.username
        this.email = this.$store.state.email
        this.firstName = this.$store.state.firstName
        this.lastName = this.$store.state.lastName
    },
    methods: {
        infoDisplay(str) {
            if (str) return str
            else return this.$t('Unfilled')
        },
        getProfile() {
            const config = {
                method: 'post',
                path: '/1/sys/c/user/profile/get/',
                obj: { user_id: this.$store.state.userId },
                success: this.getProfileSuccess,
                error: this.handleError
            }
            this.ajax(config)
        },
        getProfileSuccess(response) {
            const { data: { data: user } } = response
            if (user?.profile) this.profile = user.profile
            if (user?.profile?.camera_scan) this.cameraScan = true
        },
        handleError(response) {
            let errMsg = this.$t('Error.UserProfile.General')
            errMsg += `(${response.status})`
            console.error(response)
            this.$Message.error(errMsg)
        },
        setLocale(locale) {
            this.profile.language = locale
            const obj = {
                userProfile: JSON.stringify(this.profile),
                userId: this.$store.state.userId
            }
            this.apiLoading = true
            this.$i18n.locale = locale
            const config = {
                method: 'post',
                path: '/1/sys/c/user/profile/update/',
                obj: obj,
                success: this.updateProfileSuccess,
                error: this.updateProfileError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        updateProfileSuccess() {
            const msg = `${this.$t('Update')} ${this.$t('Success')}`
            this.$Message.success(msg)
        },
        updateProfileError(response) {
            const msg = `${this.$t('Update')} ${this.$t('Failed')} (${response.status})`
            this.$Message.error(msg)
        },
        langInit() {
            return this.$i18n.locale || 'zh_tw'
        },
        setCamera() {
            this.profile.camera_scan = this.cameraScan
            this.$store.commit('updateData', {
                param: 'cameraScan',
                data: this.cameraScan
            })
            const obj = {
                userProfile: JSON.stringify(this.profile),
                userId: this.$store.state.userId
            }
            this.apiLoading = true
            const config = {
                method: 'post',
                path: '/1/sys/c/user/profile/update/',
                obj: obj,
                success: this.updateProfileSuccess,
                error: this.updateProfileError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        }
    },
    watch: {
        lang(str) {
            this.setLocale(str)
        }
    }
}
</script>