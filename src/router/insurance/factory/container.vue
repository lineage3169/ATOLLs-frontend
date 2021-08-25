<template>
    <div class="content__view"
         :class="{'bg-color--primary': view === 'ProgressUpdate'}">
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
    name: 'Factory',
    components: {
        ProgressUpdate: resolve => require(['./progress-update.vue'], resolve),
        PackageUpdate: resolve => require(['./package-update.vue'], resolve),
        ProgressCheck: resolve => require(['./progress-check.vue'], resolve),
        PendingList: resolve => require(['./pending-list.vue'], resolve),
        Valuation: resolve => require(['./valuation.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'ProgressUpdate',
            license: [
                {
                    name: 'ProgressUpdate',
                    permission: 'progress-update@factory@INS',
                    label: `${this.$t('Progress')}${this.$t('Update')}`
                },
                {
                    name: 'PackageUpdate',
                    permission: 'package-update@factory@INS',
                    label: `${this.$t('Package')}${this.$t('Update')}`
                },
                {
                    name: 'ProgressCheck',
                    permission: 'progress-check@factory@INS',
                    label: `${this.$t('Progress')}${this.$t('Check')}`
                },
                {
                    name: 'PendingList',
                    permission: 'pending-list@factory@INS',
                    label: `${this.$t('Pending')}${this.$t('ListA')}`
                },
                {
                    name: 'Valuation',
                    permission: 'valuation@factory@INS',
                    label: `${this.$t('Valuation')}${this.$t('Setting')}`
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