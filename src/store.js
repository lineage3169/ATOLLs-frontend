import Vue from 'vue'
import Vuex from 'vuex'
import i18n from '@/lang/lang.js'
import pmMenu from '@/menu/parking-mgnt.js'
import insMenu from '@/menu/insurance.js'

Vue.use(Vuex)

const DEBUG = false
let username = ''
let groups = []
let features = ''
let backendUrl = '/a'

if (DEBUG) {
    backendUrl = 'https://127.0.0.1:8008/a'
    // backendUrl = 'https://35.201.225.229/a'
    // backendUrl = 'https://atolls.ryzoweba.com/a'
    // backendUrl = 'https://192.168.8.8:8018/a'
    username = 'atoll'
    groups = ['*']
    features = '*'
}

export default new Vuex.Store({
    strict: true,
    state: {
        username: username,
        csrfToken: '',
        groups: groups,
        features: features,
        backendUrl: backendUrl,
        email: null,
        firstName: null,
        lastName: null,
        profile: null,
        userId: null,
        focusItem: null,
        cameraScan: false,
        billCateNameMap: {},
        channelNameMap: {},
        mailTypeNameMap: {},
        quota: {},
        postNameMap: {
            1: i18n.t('OrdinaryMail'),
            2: i18n.t('RegisteredMail'),
            3: i18n.t('RegisteredMailAR'),
            4: i18n.t('ExpressMail')
        },
        cycleTypeNameMap: {
            B: i18n.t('NormalB'),
            O: i18n.t('UrgentA')
        },
        noticeMap: {
            0: i18n.t('Logging'), // 將通知記錄在檔案上
            1: i18n.t('EMail'), // 由電子郵件傳送
            2: i18n.t('SMS'), // 由簡訊傳送
            3: i18n.t('IM'), // 由即時通訊傳送
            4: i18n.t('WSS') // 由網頁傳送通知
        },
        progressNameMap: {
            RC: i18n.t('Received'), // 已接收
            CO: i18n.t('Converted'), // 已轉檔
            PR: i18n.t('Printed'), // 已列卬
            BD: i18n.t('Binded'), // 已膠裝
            CK: i18n.t('Checked'), // 已檢驗
            PA: i18n.t('Packaged'), // 已裝封
            PO: i18n.t('Posted') // 已交寄
        },
        statusNameMap: {
            N: i18n.t('NormalB'),
            R: i18n.t('RejectA'),
            CR: i18n.t('CheckAndReject'),
            P: i18n.t('PickOutA')
        },
        keyNameMap: {
            register_number: i18n.t('RegisterNumber'),
            package_code: i18n.t('PackageCode'),
            mail_date: i18n.t('MailDate'),
            remarks: i18n.t('Remarks'),
            recipient: i18n.t('RecipientA'),
            recipient_address: i18n.t('RecipientA') + i18n.t('Address'),
            mail_type: i18n.t('MailType'),
            Haika: i18n.t('Haika'),
            effective_date: i18n.t('EffectiveDate'),
            posting_service: i18n.t('PostingService'),
            progress: i18n.t('Progress'),
            in_factory: i18n.t('ReceivingWorkplace'),
            unit_name: i18n.t('Unit') + i18n.t('Name'),
            agt_name: i18n.t('AgentB') + i18n.t('Name'),
            return_code: i18n.t('InsPolicy&Form') + i18n.t('ReturnCode')
        },
        moduleTypePool: [
            {
                value: 'PM',
                label: `${i18n.t('Parking')}${i18n.t('Management')}${i18n.t('Module')}`
            },
            {
                value: 'INS',
                label: `${i18n.t('Insurance')}${i18n.t('Management')}${i18n.t('Module')}`
            }
        ],
        moduleTypeList: [
            {
                value: 'PM',
                label: `${i18n.t('Parking')}${i18n.t('Management')}${i18n.t('Module')}`
            },
            {
                value: 'INS',
                label: `${i18n.t('Insurance')}${i18n.t('Management')}${i18n.t('Module')}`
            }
        ],
        menu: {
            PM: pmMenu,
            INS: insMenu
        },
        moduleType: ''
    },
    mutations: {
        initModuleType(state) {
            function deepCopy(data) {
                return JSON.parse(JSON.stringify(data))
            }
            state.moduleTypeList = deepCopy(state.moduleTypePool)
        },
        filterMenu(state, type) {
            state.moduleTypeList = state.moduleTypeList
                .filter(item => item.value !== type)
        },
        updateData(state, data) {
            if (data.param) {
                const param = typeof (data.param) === 'string' ? data.param
                    : data.param.toString()
                state[param] = data.data
            }
        },
        deleteData(state) {
            const ignore = ['backendUrl', 'noticeMap', 'moduleTypeList',
                'moduleTypePool', 'menu', 'postNameMap', 'cycleTypeNameMap',
                'progressNameMap', 'statusNameMap', 'keyNameMap', 'moduleType']
            for (const key in state) {
                if (key === 'groups') state[key] = []
                else if (key === 'cameraScan') state[key] = false
                else if (ignore.indexOf(key) === -1) state[key] = null
            }
        }
    },
    getters: {
        permission: state => permission => {
            let features = []
            if (state.features) {
                // layer 1
                features = state.features.split(',')
                // layer 2
                const menu = new Set(features
                    .filter(item => item.split('@').length === 3)
                    .map(item => {
                        const arr = item.split('@')
                        arr.shift()
                        return arr.join('@')
                    }))
                // layer 3
                const modules = new Set(features
                    .filter(item => item.split('@').length === 3)
                    .map(item => item.split('@')[2]))
                features = [...features, ...menu, ...modules]
            }
            if (features.indexOf(permission) > -1 || features.indexOf('*') > -1)
                return true
            return false
        }
    }
})