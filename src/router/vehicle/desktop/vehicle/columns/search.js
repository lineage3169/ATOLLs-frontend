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
            // 生產編號
            title: _this.$t('Produce') + _this.$t('ID'),
            key: 'origin_id'
        },
        {
            // 底盤編號
            title: _this.$t('Chassis') + _this.$t('ID'),
            key: 'name'
        },
        {
            // QRcode
            title: 'QRcode',
            key: 'barcode'
        },
        {
            // 建立日期
            title: _this.$t('Create') + _this.$t('Date'),
            key: 'create_time'
        },
        {
            // 配額單位
            title: _this.$t('Quota') + _this.$t('Unit'),
            key: 'quota'
        },
        {
            // 停車區域
            title: _this.$t('ParkingArea'),
            key: 'pg_name'
        },
        {
            // 車位識別碼
            title: _this.$t('ParkingSpace') + _this.$t('IDA'),
            key: 'ps_info_barcode'
        },
        {
            // 待複檢
            title: _this.$t('Reconfirm'),
            key: 'reconfirm',
            render: (h, params) => {
                if (params.row.reconfirm) {
                    return h('div', [
                        h('Icon', {
                            props: {
                                type: 'md-checkmark'
                            },
                            style: {
                                color: '#11b136',
                                fontSize: '20px'
                            }
                        })
                    ])
                }
            }
        },
        {
            title: _this.$t('Action'),
            key: 'action',
            align: 'center',
            width: _this.type === 'Edit' ? 120 : 300,
            fixed: 'right',
            render: (h, params) => {
                if (_this.type === 'Edit') {
                    return h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleSelect(params.row.id, 'editShow')
                            }
                        }
                    }, _this.$t('Edit'))
                }
                const btns = [
                    // 日誌
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleLog(params.row.id)
                            }
                        }
                    }, _this.$t('Log')),
                    // 附件
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleSelect(params.row.id, 'attachedShow')
                            }
                        }
                    }, _this.$t('AttachedFile')),
                    // 配件
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleSelect(params.row.id, 'gadgetsShow')
                            }
                        }
                    }, _this.$t('Gadgets')),
                    // 消除
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.removeRows(params.row.id)
                            }
                        }
                    }, _this.$t('RemoveB'))
                ]
                const groupBtns = h('ButtonGroup', btns)
                return groupBtns
            }
        }
    ]
}