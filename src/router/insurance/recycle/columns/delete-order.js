import RowExpand from '@/components/row-expand.vue'
export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            type: 'expand',
            width: 30,
            render: (h, params) => {
                return h(RowExpand, {
                    props: {
                        row: params.row.custom
                    }
                })
            }
        },
        {
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'name',
            width: 150
        },
        {
            title: _this.$t('PolicyOwnerName'),
            key: 'policy_owner_name',
            minWidth: 110
        },
        {
            title: _this.$t('InsuredName'),
            key: 'insured_name',
            width: 110
        },
        {
            title: _this.$t('Batch') + _this.$t('Date'),
            key: 'cycle_date',
            render: (h, params) => {
                return h('div', _this.convertDateToDisplay(params.row.cycle_date))
            },
            minWidth: 120
        },
        {
            title: _this.$t('BusinessSource'),
            key: 'billing_category',
            minWidth: 110
        },
        {
            title: _this.$t('TypeCode'),
            key: 'type_code',
            minWidth: 110
        },
        {
            title: _this.$t('BusinessAssociation') + _this.$t('Code'),
            key: 'unit_id',
            minWidth: 120
        },
        {
            title: _this.$t('ChannelA'),
            key: 'channel',
            minWidth: 110
        },
        {
            title: _this.$t('Status'),
            key: 'status',
            minWidth: 110
        },
        {
            title: _this.$t('Batch') + _this.$t('TypeA'),
            key: 'cycle_type',
            minWidth: 110
        }
    ]
}