<template>
    <div class="content__view parking-area-container">
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
    name: 'ParkingArea',
    components: {
        Remaining: resolve => require(['./remaining-ps.vue'], resolve),
        AreaMgnt: resolve => require(['./area-mgnt.vue'], resolve),
        TheFooter: resolve => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'AreaMgnt',
            license: [
                {
                    name: 'Remaining',
                    permission: 'remaining@parking-area@PM',
                    label: `${this.$t('View')}${this.$t('Remaining')}${this.$t('ParkingSpace')}`
                },
                {
                    name: 'AreaMgnt',
                    permission: 'area-mgnt@parking-area@PM',
                    label: `${this.$t('AreaMgnt')}`
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