<template>
    <div class="c-search-row-expand">
        <div v-for="(k, index) in Object.keys(row)"
            class="expand__area"
            :key="index">
             <template v-if="k == $t('Progress')">
                <Tooltip  placement='right-start'
                          :content="progressTooltips"
                          :maxWidth="250"
                          :delay="1000">
                    <div class="expand__area__title">
                        <Icon type="md-help-circle"/>
                        {{ k }}
                    </div>
                </Tooltip>
                    <div class="expand__area__content">{{ row[k] }}</div>
             </template>
             <template v-else>
                <div class="expand__area__title">{{ k }}</div>
                <div class="expand__area__content">{{ row[k] }}</div>
             </template>
        </div>
    </div>
</template>
<script>
export default {
    name: 'SearchRowExpand',
    props: {
        row: Object
    },
    computed: {
        progressTooltips() {
            const content = ['Received', 'Converted', 'Printed',
                'Binded', 'Checked', 'Packaged', 'Posted']
            const contentI18n = content.map(item => this.$t(item))
            return contentI18n.join(' > ')
        }
    }
}
</script>