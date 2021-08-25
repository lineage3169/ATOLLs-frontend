<template>
    <div class="p-login">
        <div v-if="isParkingMgnt" class="car-stripe"></div>
        <div class="form">
            <div class="form__logo">
                <div class="logo__img">
                    <img v-if="isParkingMgnt"
                        src="../../assets/images/logo-benz.svg"
                        alt="Benz logo">
                    <img v-else
                        src="../../assets/images/logo.png"
                        alt="Atolls logo">
                </div>
            </div>
            <div class="sign-in">
                <div class="sign-in__input">
                    <div class="input__items">
                        <div class="input__icon">
                            <Icon class="icon__items" type="md-contact" />
                        </div>
                        <input v-model="user"
                                class="input"
                                type="text"
                                :placeholder="$t('Account')">
                    </div>
                    <div class="input__items">
                        <div class="input__icon">
                            <Icon class="icon__items" type="md-lock" />
                        </div>
                        <input v-model="password"
                                class="input"
                                autocomplete="new-password"
                                type="password"
                                :placeholder="$t('Password')"
                                @keypress.enter="loginVerify()">
                    </div>
                </div>
                <div class="sign-in__btn">
                    <Button id="sign-btn"
                            class="btn__signin"
                            :loading="apiLoading"
                            @click.stop="loginVerify()">
                        {{ $t('SignIn') }}
                    </Button>
                </div>
            </div>
        </div>
        <div v-if="isParkingMgnt" class="powered-by">
            Powered by
            <a class="highlight-color" href="mailto:ed3169@fucotech.com.tw">
                ATOLLs
            </a>
             Fuco Technology Corp.
        </div>
        <div v-show="welcomeShow" class="welcome-page">
            <div class="welcome-page__title">
                {{ welcomeTitle }}
            </div>
            <div class="welcome-page__info">
                存車管理系統
            </div>
            <img v-if="welcomeImage"
                class="welcome-page__img"
                :src="welcomeImage"/>
            <img v-else
                class="welcome-page__img"
                src="../../assets/images/welcome-page.jpg"/>
            <div class="powered-by">
                Powered by
                <a class="highlight-color" href="mailto:ed3169@fucotech.com.tw">
                    ATOLLs
                </a>
                Fuco Technology Corp.
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'Login',
    data() {
        return {
            imgURL: this.$store.state.backendUrl + '/1/pm/c/others/image/get/',
            welcomeImage: '',
            welcomeTitle: '中華賓士',
            user: '',
            password: '',
            welcomeShow: false,
            isMobile: false,
            apiLoading: false
        }
    },
    created() {
        const isMobile = localStorage.getItem('atolls-isMobile')
        this.isMobile = isMobile ? JSON.parse(isMobile) : false
        // Force mobile mode
        const mobiles = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i
        if (mobiles.test(navigator.userAgent)) {
            localStorage.setItem('atolls-isMobile', true)
            this.isMobile = true
        }
    },
    methods: {
        loginVerify() {
            if (!this.user) {
                this.$Modal.error({
                    title: this.$t('ERROR'),
                    content: this.$t('Error.Login.accountFill'),
                    okText: this.$t('OK')
                })
            }
            else if (!this.password) {
                this.$Modal.error({
                    title: this.$t('ERROR'),
                    content: this.$t('Error.Login.passwordFill'),
                    okText: this.$t('OK')
                })
            }
            else this.login()
        },
        login() {
            const postObj = {
                user: this.user,
                password: this.password
            }
            const headerObj = { 'X-CSRFToken': this.$cookies.get('csrftoken') }

            this.apiLoading = true
            const config = {
                method: 'post',
                path: '/1/sys/c/auth/login/',
                header: headerObj,
                obj: postObj,
                success: this.loginSuccess,
                error: this.loginError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        loginSuccess(response) {
            if (!response.data.data.features) {
                return this.$Modal.warning({
                    title: this.$t('WARNING'),
                    content: this.$t('Modal.NoFeatures'),
                    okText: this.$t('OK')
                })
            }
            this.setUpdateData(response)
            this.$store.commit('initModuleType')
            // 過濾停車場管理模組
            if (!this.hasPermission('PM'))
                this.$store.commit('filterMenu', 'PM')
            // 過濾壽險管理模組
            if (!this.hasPermission('INS'))
                this.$store.commit('filterMenu', 'INS')
            if (response?.data?.data?.profile)
                this.setProfile(response.data.data.profile)
            const sotrageData = localStorage.getItem('atolls-isMobile')
            const isMobile = sotrageData ? JSON.parse(sotrageData) : false
            if (isMobile) {
                const hasGroups = response?.data?.data?.groups
                if (!hasGroups)
                    return this.goToMobilePage()
                this.setWelcomePage(response)
                this.goToMobilePage()
            }
            else this.$router.push('/frontend/')
        },
        loginError(response) {
            let errMsg = this.$t('Error.Login.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 登入資訊輸入錯誤
                    errMsg += this.$t('Error.Login.Code1')
                    break
                case 2:
                    // 無效的授權碼
                    errMsg += this.$t('Error.Login.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setWelcomePage(response) {
            const groups = response.data.data.groups
                .map(item => {
                    if (item?.profile?.images)
                        [item.image] = item.profile.images
                    return item
                })
            if (groups.length === 1) {
                const [group] = groups
                if (group.image)
                    this.welcomeImage = this.imgURL + `?id=${group.id}&image=${group.image}`
                this.welcomeTitle = group.alias
            }
        },
        goToMobilePage() {
            this.welcomeShow = true
            const t = setTimeout(() => {
                clearTimeout(t)
                this.welcomeShow = false
                this.$router.push('/m-frontend/')
            }, 3000)
        },
        setProfile(profile) {
            if (!profile || typeof profile !== 'object') return
            if (profile?.language) this.$i18n.locale = profile.language
            if (profile?.camera_scan) this.setCameraScan(true)
        },
        setUpdateData(response) {
            const updateData = param => this.$store.commit('updateData', param)
            const responseData = key => {
                return {
                    param: key,
                    data: response.data.data[key]
                }
            }
            const updateKeys = ['csrfToken', 'groups', 'email', 'firstName',
                'lastName', 'profile', 'userId', 'username',
                'features']
            updateKeys.forEach(key => updateData(responseData(key)))
        },
        handleMobile(data) {
            localStorage.setItem('atolls-isMobile', data)
        },
        setCameraScan(boolean) {
            this.$store.commit('updateData', {
                param: 'cameraScan',
                data: boolean
            })
        }
    },
    computed: {
        isParkingMgnt() {
            return this.$store.state.moduleType === 'PM'
        }
    }
}
</script>