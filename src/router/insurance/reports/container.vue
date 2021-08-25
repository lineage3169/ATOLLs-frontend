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
            <component :is="view"></component>
        </div>
        <TheFooter/>
    </div>
</template>

<script>
export default {
    name: 'Report',
    components: {
        Valuation: resolve => require(['@/router/insurance/reports/valuation.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'Valuation',
            license: [
                {
                    name: 'Valuation',
                    permission: 'valuation@reports@INS',
                    label: `${this.$t('BillingReport')}`
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