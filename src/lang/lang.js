import Vue from 'vue'
import VueI18n from 'vue-i18n'

Vue.use(VueI18n)

const i18n = new VueI18n({
    locale: 'zh_tw',
    messages: {
        zh_tw: require('@/lang/json/zh_tw.json'),
        en_us: require('@/lang/json/en_us.json')
    }
})

export default i18n