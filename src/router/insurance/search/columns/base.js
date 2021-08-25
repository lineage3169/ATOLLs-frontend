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
            // 保單/表單號碼
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'name',
            width: 140
        },
        {
            // 要保人
            title: _this.$t('PolicyOwnerName'),
            key: 'policy_owner_name',
            minWidth: 110
        },
        {
            // 被保人
            title: _this.$t('InsuredName'),
            key: 'insured_name',
            width: 110
        },
        {
            // 批次日期
            title: _this.$t('Batch') + _this.$t('Date'),
            key: 'cycle_date',
            render: (h, params) => {
                return h('div', _this.convertDateToDisplay(params.row.cycle_date))
            },
            minWidth: 120
        },
        {
            // 業務來源
            title: _this.$t('BusinessSource'),
            key: 'billing_category',
            minWidth: 110
        },
        {
            // 險種代碼
            title: _this.$t('TypeCode'),
            key: 'type_code',
            minWidth: 110
        },
        {
            // 業務關聯代碼
            title: _this.$t('BusinessAssociation') + _this.$t('Code'),
            key: 'unit_id',
            minWidth: 120
        },
        {
            // 通路
            title: _this.$t('ChannelA'),
            key: 'channel',
            minWidth: 140
        },
        {
            // 狀態
            title: _this.$t('Status'),
            key: 'status',
            minWidth: 110
        },
        {
            // 批次類型
            title: _this.$t('Batch') + _this.$t('TypeA'),
            key: 'cycle_type',
            minWidth: 110
        },
        {
            title: _this.$t('Action'),
            key: 'log',
            align: 'center',
            width: 150,
            fixed: 'right',
            render: (h, params) => {
                return h('div',
                    {
                        style: {
                            display: 'flex'
                        }
                    },
                    [
                        h('Button', {
                            attrs: {
                                id: `e2e__searchBtn__${params.index}`
                            },
                            class: 'btn--table mr-5',
                            props: {
                                type: 'text'
                            },
                            style: {
                                minWidth: '55px'
                            },
                            on: {
                                click: () => {
                                    _this.handleLogSearch(params.index)
                                }
                            }
                        }, _this.$t('Search')),
                        h('Button', {
                            class: 'btn--table',
                            props: {
                                type: 'text',
                                disabled: params.row.pdfDiasble
                            },
                            style: {
                                minWidth: '55px'
                            },
                            on: {
                                click: () => {
                                    _this.handleDownload(params.index)
                                }
                            }
                        }, 'PDF')
                    ])
            }
        }
    ]
}