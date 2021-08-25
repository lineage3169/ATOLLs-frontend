export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            title: _this.$t('OrderCode'),
            key: 'code'
        },
        {
            title: _this.$t('Order') + _this.$t('ID'),
            key: 'order_id'
        },
        {
            title: _this.$t('Milestone'),
            key: 'mile_stone'
        },
        {
            title: _this.$t('Action'),
            key: 'delete',
            align: 'center',
            width: 250,
            render: (h, params) => {
                const y = parseInt(params.row.order_id.slice(0, 3)) + 1911
                const m = params.row.order_id.slice(3, 5)
                const d = params.row.order_id.slice(5, 7)
                const dateFormat = `${y}-${m}-${d}`
                const today = new Date()
                const rowDate = new Date(dateFormat)
                const oneDaySec = 86400
                const oneSec = 1000
                const days = Math.floor((today - rowDate) / oneDaySec / oneSec)
                return h('div', {
                    style: {
                        display: 'flex'
                    }
                },
                [h('Button', {
                    class: 'btn--table w-150 mr-15',
                    props: {
                        size: 'small'
                    },
                    style: {
                        height: '30px !important'
                    },
                    on: {
                        click: () => { _this.confirm(params.row, 'APPROVE') }
                    }
                }, _this.$t('Approve')),
                h('Button', {
                    class: 'btn--error-outline w-150',
                    props: {
                        size: 'small',
                        disabled: days < 7
                    },
                    style: {
                        height: '30px !important'
                    },
                    on: {
                        click: () => { _this.confirm(params.row, 'DEACTIVATE') }
                    }
                }, _this.$t('Deactivate'))
                ])
            }
        }
    ]
}