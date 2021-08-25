<template>
    <div class="p-mobile-index"
        @keydown="resetTimer"
        @mouseover="resetTimer"
        @mousemove="resetTimer"
        @mousedown="resetTimer">
        <div class="navbar">
            <div class="navbar__logo" @click="toMainPage()">
                <img v-if="isParkingMgnt"
                    src="../assets/images/logo-benz.svg"
                    alt="Benz logo">
                <img v-else src="../assets/images/logo.png"
                    alt="Atolls logo">
            </div>
            <div class="navbar__menu-icon" @click.stop="menuShow = true">
                <Icon type="ios-menu" />
            </div>
        </div>
        <router-view />
        <MoblieMenu v-model="menuShow"/>
        <PermissionBlock v-if="!isPermission" :msg="msg"/>
    </div>
</template>
<script>
import MoblieMenu from '@/components/menu/m-menu.vue'
import PermissionBlock from '@/components/permission-block.vue'
export default {
    name: 'MobileIndex',
    components: { MoblieMenu, PermissionBlock },
    data() {
        return {
            reloadTime: null,
            interval: null,
            menuShow: false,
            isPermission: false,
            msg: '未取得行動裝置權限<br>將於 5 秒後登出'
        }
    },
    created() {
        this.isPermission = this.hasPermission('mobile@PM')
        if (!this.isPermission) {
            let countdown = 4
            const interval = setInterval(() => {
                this.msg = '未取得行動裝置權限<br>'
                this.msg += '將於 ' + countdown + ' 秒後登出'
                if (countdown > 0) countdown--
                else {
                    clearInterval(interval)
                    this.logout()
                }
            }, 1000)
        }
        this.resetTimer()
        this.setTimeInterval()
    },
    methods: {
        logout() {
            this.$router.push({ name: 'Logout' })
                .catch(err => { console.error(err) })
        },
        toMainPage() {
            this.$router.push({ path: '/m-frontend/' })
                .catch(err => { console.error(err) })
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
            if (date.getMinutes() >= 60) {
                this.$Modal.warning({
                    title: this.$t('WARNING'),
                    content: this.$t('Modal.LogoutAlert'),
                    okText: this.$t('OK')
                })
                this.resetTimer()
                this.$router.push('/frontend/logout/')
            }
            else if (date.getMinutes() >= 59) {
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