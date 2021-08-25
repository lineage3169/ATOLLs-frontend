<template>
    <div class="content__view">
        <div class="l-view">
            <Tabs class="noselect" @on-click="handleTabChange">
                <template v-for="(item, index) in license" >
                    <TabPane v-if="hasPermission(item.permission)"
                        :name="item.name"
                        :label="item.label"
                        :key="index"/>
                </template>
            </Tabs>
            <component :is="view" :type="moduleType"></component>
        </div>
        <TheFooter/>
    </div>
</template>

<script>
export default {
    name: 'Config',
    props: {
        moduleType: {
            type: String,
            default: ''
        }
    },
    components: {
        SystemUser: (resolve) => require(['@/router/config/system-user.vue'], resolve),
        DataGroup: (resolve) => require(['@/router/config/data-group.vue'], resolve),
        NoticeGroup: (resolve) => require(['@/router/config/notice-group.vue'], resolve),
        WelcomePage: (resolve) => require(['@/router/config/welcome-page.vue'], resolve),
        License: (resolve) => require(['@/router/config/license.vue'], resolve),
        Hardwords: (resolve) => require(['@/router/config/hardwords.vue'], resolve),
        TheFooter: (resolve) => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'SystemUser',
            license: [
                {
                    name: 'SystemUser',
                    permission: 'system-user@config@SYS',
                    label: `${this.$t('User')}`
                },
                {
                    name: 'DataGroup',
                    permission: 'data-group@config@SYS',
                    label: `${this.$t('Data')}${this.$t('Groups')}${this.$t('Setting')}`
                },
                {
                    name: 'NoticeGroup',
                    permission: 'notice-group@config@SYS',
                    label: `${this.$t('GroupNotice')}`
                },
                {
                    name: 'License',
                    permission: 'license@config@SYS',
                    label: `${this.$t('License')}`
                },
                {
                    name: 'Hardwords',
                    permission: 'hardwords@config@SYS',
                    label: `${this.$t('Hardwords')}${this.$t('Upload')}`
                }
            ]
        }
    },
    created() {
        if (this.moduleType)
            this.setTabs(this.moduleType)
        this.setView()
    },
    methods: {
        setView() {
            const license = this.license
            for (let i = 0; i < license.length; i++) {
                if (this.hasPermission(license[i].permission)) {
                    this.view = license[i].name
                    return
                }
            }
        },
        handleTabChange(name) {
            this.view = name
        },
        setTabs(type) {
            // Set data group name
            this.license = this.license.map(item => {
                if (item.name === 'DataGroup') {
                    if (type === 'PM')
                        item.label = `${this.$t('Unit')}${this.$t('Setting')}`
                    else
                        item.label = `${this.$t('Data')}${this.$t('Groups')}${this.$t('Setting')}`
                }
                return item
            })
            // Hide NoticeGroup in Parking Module
            if (type === 'PM') {
                this.license = this.license
                    .filter(item => item.name !== 'NoticeGroup')
            }
            // Set welcome page
            if (type === 'PM') {
                const index = this.license
                    .findIndex(item => item.name === 'DataGroup')
                const tab = {
                    name: 'WelcomePage',
                    permission: 'welcome-page@config@SYS',
                    label: `${this.$t('Welcome')}${this.$t('Page')}${this.$t('Config')}`
                }
                this.license.splice(index + 1, 0, tab)
            }
            else {
                this.license = this.license
                    .filter(item => item.name !== 'WelcomePage')
            }
            // Set hardword tab
            if (type === 'PM') {
                this.license = this.license
                    .filter(item => item.name !== 'Hardwords')
            }
            else {
                const index = this.license
                    .findIndex(item => item.name === 'Hardwords')
                if (index === -1) {
                    this.license.push({
                        name: 'Hardwords',
                        permission: 'hardwords@config@SYS',
                        label: `${this.$t('Hardwords')}${this.$t('Upload')}`
                    })
                }
            }
        }
    },
    watch: {
        moduleType(type) {
            if (type) this.setTabs(type)
        }
    }
}
</script>