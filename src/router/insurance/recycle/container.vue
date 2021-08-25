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
    name: 'Recycle',
    components: {
        DeleteOrder: (resolve) => require(['@/router/insurance/recycle/delete-order.vue'], resolve),
        TheFooter: (resolve) => require(['@/components/footer.vue'], resolve)
    },
    data() {
        return {
            view: 'DeleteOrder',
            license: [
                {
                    name: 'DeleteOrder',
                    permission: 'delete-order@recycle@INS',
                    label: `${this.$t('Delete')}${this.$t('Order')}`
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
        handleTabChange: function(name) {
            this.view = name
        }
    }
}
</script>