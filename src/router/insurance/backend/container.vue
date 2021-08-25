<template>
    <div class="content__view bg-color--primary">
        <div class="l-view">
            <Tabs class="noselect" @on-click="handleTabChange">
                <template v-for="(item, index) in license" >
                    <TabPane v-if="hasPermission(item.permission)"
                        :name="item.name"
                        :label="item.label"
                        :key="index"/>
                </template>
            </Tabs>
            <component :is="view"></component>
        </div>
        <TheFooter/>
    </div>
</template>

<script>
export default {
    name: 'Backend',
    components: {
        ApiTest: resolve => require(['@/router/insurance/backend/api-test.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'ApiTest',
            license: [
                {
                    name: 'ApiTest',
                    permission: 'api-test@backend@SYS',
                    label: `API${this.$t('Test')}`
                }
            ]
        }
    },
    created() {
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
        }
    }
}
</script>