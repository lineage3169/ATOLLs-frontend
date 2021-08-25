<template>
    <div class="content__view vehicle-container">
        <div class="l-view">
            <Tabs class="noselect" @on-click="handleTabChange">
                <template v-for="(item, index) in license" >
                    <TabPane v-if="hasPermission(item.permission)"
                        :name="item.name"
                        :label="item.label"
                        :key="index"/>
                </template>
            </Tabs>
            <component :is="view" v-bind="type"></component>
        </div>
        <TheFooter/>
    </div>
</template>

<script>
export default {
    name: 'Vehicle',
    components: {
        Search: resolve => require(['./search-and-edit.vue'], resolve),
        Edit: resolve => require(['./search-and-edit.vue'], resolve),
        Maintenance: resolve => require(['./maintenance.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'Search',
            license: [
                {
                    name: 'Search',
                    permission: 'search@vehicle@PM',
                    label: `${this.$t('Search')}`
                },
                {
                    name: 'Edit',
                    permission: 'edit@vehicle@PM',
                    label: `${this.$t('Edit')}`
                },
                {
                    name: 'Maintenance',
                    permission: 'maintenance@vehicle@PM',
                    label: `${this.$t('ToBeMaintenanced')}`
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
    },
    computed: {
        type() {
            if (this.view) return { type: this.view }
            return ''
        }
    }
}
</script>