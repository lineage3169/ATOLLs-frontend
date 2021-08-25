import Vue from 'vue'
import axios from 'axios'
import i18n from '@/lang/lang.js'
const qs = require('query-string')
const methods = {
    methods: {
        deepCopy(data) {
            return JSON.parse(JSON.stringify(data))
        },
        isJson(str) {
            try { JSON.parse(str) }
            catch (e) { return false }
            return true
        },
        ajax(config) {
            if (typeof (config) !== 'object') return console.error('未提供config')
            const method = config.method.toLowerCase() || 'none'
            if (method !== 'post' && method !== 'get') return console.error('方法錯誤')
            if (typeof (config.path) !== 'string') return console.error('路徑需為字串型別')

            const axiosConfig = {
                baseURL: this.$store.state.backendUrl,
                url: config.path,
                method: method,
                headers: { 'X-CSRFToken': this.$store.state.csrfToken }
            }
            const obj = config.obj || {}
            if (method === 'get') axiosConfig.params = obj
            if (method === 'post') {
                if (config.fromData)
                    axiosConfig.data = config.fromData
                else
                    axiosConfig.data = qs.stringify(obj)
            }
            if (config.header && typeof (config.header) === 'object')
                axiosConfig.headers = config.header
            if (config.type && typeof (config.type) === 'string')
                axiosConfig.responseType = config.type
            if (config.baseURL)
                axiosConfig.baseURL = config.baseURL
            if (config.timeout && !isNaN(parseInt(config.timeout)))
                axiosConfig.timeout = parseInt(config.timeout)

            return axios(axiosConfig)
                .then(response => {
                    if (config.success && typeof (config.success) === 'function') {
                        try {
                            config.success(response, config.params)
                        }
                        catch (e) {
                            console.error(e)
                            let msg = 'Client Error<br>'
                            msg += 'path: ' + config.path + '<br><br>'
                            msg += e
                            return Vue.prototype.$Modal.error({
                                title: i18n.t('ERROR'),
                                content: msg,
                                okText: i18n.t('OK')
                            })
                        }
                    }
                })
                .catch(error => {
                    if (error.response) {
                        if (config.error && typeof (config.error) === 'function')
                            config.error(error.response, config.params)
                    }
                    else if (error.request) console.error(error.request)
                })
                .finally(response => {
                    if (config.final && typeof (config.final) === 'function') config.final(response)
                })
        },
        hasPermission(key) {
            if (typeof (key) === 'string')
                return this.$store.getters.permission(key)
            else return key
        },
        isASCII(str) {
            return /^[\x00-\x7F]*$/.test(str)
        },
        capitalizeFirstLetter([first, ...rest], locale = navigator.language) {
            return [first.toLocaleUpperCase(locale), ...rest].join('')
        },
        sec(data) {
            const sec = 1000
            if (typeof (data) !== 'number') {
                console.error('value is not number')
                return
            }
            return data * sec
        },
        unexpectedErrMsg(res) {
            let msg = ''
            let str = ''
            const d = new Date()
            if (res.data) msg = res.data
            str += `${this.$t('Error.Unexpected')} (${res.status})<br>`
            if (msg && typeof (msg) === 'string') str += `${msg}<br>`
            str += `${d.toLocaleString()}`
            return str
        },
        errorModal(msg) {
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: msg,
                okText: this.$t('OK')
            })
        },
        resetDataMsg() {
            let msg = ''
            msg += this.$t('Already')
            msg += this.$t('Reset')
            msg += this.$t('Data')
            this.$Message.info(msg)
        },
        hadleI18n(data) {
            if (typeof data === 'string')
                return this.$t(data)
            if (typeof data === 'object' && data.length > 0) {
                let str = ''
                data.forEach(item => {
                    str += this.$t(item)
                })
                return str
            }
        },
        dateToFormat(data, clock = true, combined = false) {
            if (!data) return ''
            function pad(num) {
                return num.toString().padStart(2, '0')
            }
            const date = new Date(data)
            const year = date.getFullYear()
            const month = pad(date.getMonth() + 1)
            const day = pad(date.getDate())
            const h = pad(date.getHours())
            const m = pad(date.getMinutes())
            const s = pad(date.getSeconds())
            if (clock && !combined)
                return `${year}-${month}-${day} ${h}:${m}:${s}`
            else if (clock && combined)
                return `${year}-${month}-${day}T${h}:${m}:${s}`
            else
                return `${year}-${month}-${day}`
        },
        isEmptyArray(arr) {
            let hasValue = false
            if (arr && arr.length > 0)
                arr.forEach(item => { if (item) hasValue = true })
            return !hasValue
        },
        getGroupsI18n(type) {
            if (type === 'PM')
                return this.$t('Unit')
            return this.$t('Groups')
        },
        focusOn(id) {
            document.querySelector(id).focus()
        }
    }
}
export default methods