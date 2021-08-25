export default function(data = null) {
    if (!data) return []
    const _this = data
    return [
        {
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'object_name',
            width: 150,
            fixed: 'left'
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
            title: _this.$t('BillingA') + _this.$t('CategoryA'),
            key: 'billing_category',
            minWidth: 110
        },
        {
            title: _this.$t('Original') + _this.$t('Status'),
            key: 'original_status',
            minWidth: 110
        },
        {
            title: _this.$t('New') + _this.$t('Status'),
            key: 'status',
            filters: [
                { label: _this.$t('NormalB'), value: 'N' },
                { label: _this.$t('RejectA'), value: 'CR' },
                { label: _this.$t('PickOutA'), value: 'P' }
            ],
            filterMultiple: false,
            filterMethod(value, row) {
                if (value === 'N')
                    return row.status === _this.$t('NormalB')
                else if (value === 'CR')
                    return row.status === _this.$t('RejectA')
                else if (value === 'P')
                    return row.status === _this.$t('PickOutA')
            },
            minWidth: 110
        },
        {
            title: _this.$t('PackageCode'),
            width: 120,
            key: 'package_code'
        },
        {
            title: _this.$t('BarcodeA'),
            width: 170,
            key: 'barcode'
        },
        {
            title: _this.$t('Issuer'),
            key: 'orderer',
            minWidth: 110
        },
        {
            title: _this.$t('Date'),
            width: 180,
            key: 'create_time'
        },
        {
            title: _this.$t('Reason'),
            key: 'remarks',
            minWidth: 250,
            render: (h, params) => {
                if (params.row.changes && params.row.changes.update_address) {
                    const arr = []
                    arr.push(h('div', `${params.row.remarks}`))
                    arr.push(h('div', {
                        style: {
                            fontWeight: 'bold'
                        }
                    }, `>${params.row.changes.update_address}`))
                    return arr
                }
                else return h('div', `${params.row.remarks}`)
            }
        }
    ]
}