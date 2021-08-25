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
    name: 'Search',
    components: {
        BaseSearch: resolve => require(['@/router/insurance/search/base.vue'], resolve),
        OperationSearch: resolve => require(['@/router/insurance/search/operation.vue'], resolve),
        OperationListSearch: resolve => require(['@/router/insurance/search/operation-list.vue'], resolve),
        Sampling: resolve => require(['@/router/insurance/search/sampling.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'BaseSearch',
            license: [
                {
                    name: 'BaseSearch',
                    permission: 'base@search@INS',
                    label: `${this.$t('Search')}`
                },
                {
                    name: 'OperationSearch',
                    permission: 'operation@search@INS',
                    label: `${this.$t('OperationB')}`
                },
                {
                    name: 'OperationListSearch',
                    permission: 'operation-list@search@INS',
                    label: `${this.$t('OperationA')}${this.$t('Queue')}`
                },
                {
                    name: 'Sampling',
                    permission: 'sample@search@INS',
                    label: `${this.$t('Sample')}${this.$t('Check')}`
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