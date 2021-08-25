export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 車位識別碼
            title: _this.$t('ParkingSpace') + _this.$t('IDA'),
            key: 'barcode'
        },
        {
            // 停車區域
            title: _this.$t('ParkingArea'),
            key: 'pg_name'
        },
        {
            // 使用中
            title: _this.$t('Used'),
            key: 'used',
            render: (h, params) => {
                var iconType = 'md-close'
                if (params.row.used)
                    iconType = 'md-checkmark'

                return h('div', [
                    h('Icon', {
                        props: {
                            type: iconType,
                            size: '24'
                        },
                        style: {
                            color: params.row.used ? '#11b136' : '#d92020'
                        }
                    })
                ])
            }
        },
        {
            // 生產編號
            title: _this.$t('Produce') + _this.$t('ID'),
            key: 'v_origin_id'
        },
        {
            // 底盤編號
            title: _this.$t('Chassis') + _this.$t('ID'),
            key: 'v_name'
        },
        {
            // QRcode
            title: 'QRcode',
            key: 'v_barcode'
        },
        {
            title: _this.$t('Action'),
            key: 'action',
            width: 140,
            align: 'center',
            fixed: 'right',
            render: (h, params) => {
                // 日誌
                return h('Button', {
                    class: 'btn--table',
                    props: {
                        size: 'default'
                    },
                    on: {
                        click: () => {
                            _this.handleLog(params.row.id)
                        }
                    }
                }, _this.$t('Log'))
            }
        }
    ]
}