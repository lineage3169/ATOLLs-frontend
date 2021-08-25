<template>
    <div class="p-index"
         @keydown="resetTimer"
         @mouseover="resetTimer"
         @mousemove="resetTimer"
         @mousedown="resetTimer">
        <Menu />
        <div class="content">
            <router-view v-if="isRouterAlive"></router-view>
        </div>
    </div>
</template>
<script>
import Menu from '@/components/menu/menu'
export default {
    name: 'Index',
    components: { Menu },
    data() {
        return {
            isRouterAlive: true,
            reloadTime: null,
            interval: null
        }
    },
    created() {
        this.getCustomData()
        this.resetTimer()
        this.setTimeInterval()
    },
    mounted() {
        if (!this.isParkingMgnt)
            this.getFonts()
    },
    methods: {
        getCustomData() {
            const baseURL = location.origin
            const config = {
                method: 'get',
                path: 'static/json/custom.json',
                baseURL: baseURL,
                success: this.getCustomSuccess,
                error: this.getCustomError
            }
            this.ajax(config)
        },
        getCustomSuccess(response) {
            const updateData = param => this.$store.commit('updateData', param)
            const responseData = key => {
                return {
                    param: key,
                    data: response.data[key]
                }
            }
            const updateKeys = Object.keys(response.data)
            updateKeys.forEach(key => updateData(responseData(key)))
        },
        getCustomError(response) {
            this.$Notice.warning({
                title: this.$t('WARNING'),
                duration: 3,
                desc: this.$t('Notice.CustomNotFound')
            })
        },
        getFonts() {
            const config = {
                method: 'get',
                path: '/1/sys/c/env/hardwords/',
                success: this.getFontSuccess,
                error: this.getFontError
            }
            this.ajax(config)
        },
        getFontSuccess() {
            var style = document.createElement('style')
            const txtNode = document.createTextNode(`
                @font-face {
                    font-family: "EUDC";
                    src: url("${this.$store.state.backendUrl}/hardwords/");
                }
                `)
            style.appendChild(txtNode)
            document.head.appendChild(style)
        },
        getFontError(response) {
            let errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    errMsg = this.$t('Error.Hardwords.Code1')
                    break
                default:
                    // 未預期的錯誤
                    errMsg = this.$t('Error.Unexpected')
                    break
                }
            }
            else {
                errMsg = `${this.$t('Notice.EUDCNotFound')}`
                console.error(response)
            }
            if (errMsg) {
                this.$Notice.warning({
                    title: this.$t('WARNING'),
                    duration: 3,
                    desc: errMsg
                })
            }
        },
        setTimeInterval() {
            this.interval = setInterval(() => {
                this.reloadTime = new Date(this.reloadTime)
                this.reloadTime.setSeconds(this.reloadTime.getSeconds() + 1)
            }, 1000)
        },
        resetTimer() {
            this.reloadTime = new Date()
            this.reloadTime.setHours(0, 0, 0, 0)
        },
        timeoutAlert(dateInput) {
            const date = new Date(dateInput)
            const limit = this.isParkingMgnt ? 60 : 20
            if (date.getMinutes() >= limit) {
                this.$Modal.warning({
                    title: this.$t('WARNING'),
                    content: this.$t('Modal.LogoutAlert'),
                    okText: this.$t('OK')
                })
                this.resetTimer()
                this.$router.push('/frontend/logout/')
            }
            else if (date.getMinutes() >= (limit - 1)) {
                this.$Modal.warning({
                    title: this.$t('WARNING'),
                    content: this.$t('Modal.LogoutConfirm'),
                    okText: this.$t('IdleBack'),
                    onOk: () => this.resetTimer()

                })
            }
        }
    },
    watch: {
        reloadTime(data) {
            this.timeoutAlert(data)
        }
    },
    computed: {
        isParkingMgnt() {
            return this.$store.state.moduleType === 'PM'
        }
    },
    beforeDestroy() {
        if (this.interval) clearInterval(this.interval)
    }
}
</script>