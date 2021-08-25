<template>
    <div class="content__view"
         :class="{'bg-color--primary':view !== 'OrderSearch' && view !== 'Valuation'}">
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
    name: 'Operations',
    components: {
        Dispatch: resolve => require(['@/router/insurance/operations/dispatch.vue'], resolve),
        OrderSearch: resolve => require(['@/router/insurance/operations/order-search.vue'], resolve),
        WrokingDay: resolve => require(['@/router/insurance/operations/working-day.vue'], resolve),
        OrderCode: resolve => require(['@/router/insurance/operations/order-code.vue'], resolve),
        Valuation: resolve => require(['@/router/insurance/operations/valuation.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'Dispatch',
            license: [
                {
                    name: 'Dispatch',
                    permission: 'dispatch@operation@INS',
                    label: `${this.$t('Dispatch')}${this.$t('Setting')}`
                },
                {
                    name: 'OrderSearch',
                    permission: 'order-search@operation@INS',
                    label: `${this.$t('Order')}${this.$t('Search')}`
                },
                {
                    name: 'WrokingDay',
                    permission: 'working-day@operation@INS',
                    label: `${this.$t('WorkingDay')}${this.$t('Config')}`
                },
                {
                    name: 'OrderCode',
                    permission: 'order-code@operation@INS',
                    label: `${this.$t('Order')}${this.$t('Confirm')}`
                },
                {
                    name: 'Valuation',
                    permission: 'valuation@operation@INS',
                    label: `${this.$t('Valuation')}${this.$t('Management')}`
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