import Vue from 'vue'
import VueAxios from 'vue-axios'
import VueCookies from 'vue-cookies'
import VueRx from 'vue-rx'
import VuejsClipper from 'vuejs-clipper/dist/vuejs-clipper.umd'
import App from './App.vue'
import axios from 'axios'
import router from './router'
import store from './store'
import iView from 'view-design'
import i18n from '@/lang/lang.js'
import mixin from '@/mixin/main.js'
import insMixin from '@/mixin/insurance.js'
import parkingMixin from '@/mixin/parking-mgnt.js'

import 'vuejs-clipper/dist/vuejs-clipper.css'
import '@/assets/css/vendors/_iviewIndex.less'

Vue.use(iView)
Vue.use(VueAxios, axios)
Vue.use(VueCookies)
Vue.use(VueRx)
Vue.use(VuejsClipper, {
    components: {
        clipperBasic: true,
        clipperUpload: true,
        clipperPreview: true
    }
})

const sec = 1000
Vue.config.productionTip = false
axios.defaults.timeout = 15 * sec
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'

// 新增 http status code 攔截
axios.interceptors.response.use(res => { return res },
    function(error) {
        if (error.response) {
            if (error.response.status === 409) {
                Vue.prototype.$Modal.warning({
                    title: i18n.t('Timeout'),
                    content: '(409)<br>' + i18n.t('LoginAgain'),
                    okText: i18n.t('OK')
                })
                router.replace('/login')
                return new Promise(() => {})
            }
            if (error.response.status === 401) {
                Vue.prototype.$Modal.error({
                    title: i18n.t('ERROR'),
                    content: '(401)<br>' + error.response.data,
                    okText: i18n.t('OK')
                })
                return new Promise(() => {})
            }
        }
        function isJson(str) {
            try { JSON.parse(str) }
            catch (e) { return false }
            return true
        }
        let errorJson = ''
        const jsonStr = JSON.stringify(error.toJSON())
        if (isJson(jsonStr)) errorJson = error.toJSON()
        const code = errorJson.code || ''
        const message = errorJson.message || ''
        const isTimeout = code === 'ECONNABORTED' && message.indexOf('timeout') > -1
        const isNetworkErr = message === 'Network Error'

        function loadingOff() {
            const block = document.getElementById('loading-block')
            if (block) block.parentNode.removeChild(block)
        }
        if (isTimeout) {
            Vue.prototype.$Modal.confirm({
                title: i18n.t('Timeout'),
                content: i18n.t('Reconnect'),
                okText: i18n.t('Reload'),
                cancelText: i18n.t('Cancel'),
                onOk: () => { location.reload() }
            })
            return new Promise(() => {})
        }
        if (isNetworkErr) {
            loadingOff()
            Vue.prototype.$Modal.error({
                title: i18n.t('ERROR'),
                content: i18n.t('NetworkErr'),
                okText: i18n.t('OK')
            })
            return new Promise(() => {})
        }
        if (!window.navigator.onLine) {
            loadingOff()
            Vue.prototype.$Modal.error({
                title: i18n.t('WARNING'),
                content: i18n.t('Reconnect'),
                okText: i18n.t('OK')
            })
            return new Promise(() => {})
        }
        return Promise.reject(error)
    })

router.beforeEach(async (to, from, next) => {
    const requiresAuth = to.matched.some(item => item.meta.requiresAuth)
    const user = store.state.username || ''
    // 未取得使用者名稱(未登入)
    if (!user && to.fullPath !== '/login') next('/login')
    // router 中需驗證的路徑
    if (requiresAuth) {
        const features = to.meta && to.meta.features ? to.meta.features : ''
        const hasPermission = store.getters.permission(features)
        // ignore
        if (features === '*') next()
        // 使用者功能權限驗證
        else if (features && hasPermission) next()
        else {
            Vue.prototype.$Modal.error({
                title: i18n.t('ERROR'),
                content: i18n.t('Error.NoFeatures'),
                okText: i18n.t('OK')
            })
        }
    }
    else next()
})

Vue.mixin(mixin)
// 壽險管理模組
Vue.mixin(insMixin)
// 停車場管理模組
Vue.mixin(parkingMixin)

new Vue({
    router,
    i18n: i18n,
    store,
    render: h => h(App)
}).$mount('#app')