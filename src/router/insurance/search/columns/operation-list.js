export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'object_name',
            width: 140,
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
            title: _this.$t('BusinessSource'),
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
            title: _this.$t('Barcode'),
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
        },
        {
            ignore: true,
            title: _this.$t('Action'),
            key: 'cancel',
            align: 'center',
            width: 165,
            fixed: 'right',
            render: (h, params) => {
                const btns = [
                    h('Button', {
                        props: {
                            type: 'text'
                        },
                        on: {
                            click: () => {
                                _this.cancelOrder(params.index)
                            }
                        }
                    }, _this.$t('Cancel'))
                ]
                // 可改變掛單編號的保單才提供變更按鈕
                if (params.row.hasUnfilled) {
                    btns.unshift(h('Button', {
                        props: {
                            type: 'text'
                        },
                        on: {
                            click: () => {
                                _this.handleEdit(params.row)
                            }
                        },
                        style: {
                            marginRight: '5px'
                        }
                    }, _this.$t('Change')))
                }
                return h('div', btns)
            }
        }
    ]
}