export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
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
            // 車輛維護
            title: `${_this.$t('Vehicle')}${_this.$t('Maintenance')}`,
            key: 'vehicle_maintain',
            render: (h, params) => {
                const days = params.row.vehicle_maintain
                const cell = [h('div',
                    {
                        style: {
                            width: '55px',
                            paddingRight: '10px',
                            textAlign: 'Right'
                        }
                    }, `${days}${_this.$t('Days')}`)]
                const alert = params.row.vehicle_maintain_alert
                if (alert) {
                    // 保養
                    cell.push(h('Button', {
                        class: 'btn--warning',
                        props: {
                            size: 'small'
                        },
                        style: {
                            minWidth: 'unset',
                            height: '24px',
                            padding: '0 7px',
                            fontSize: '14px'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'MAINTAIN', 'VM')
                            }
                        }
                    }, _this.$t('MaintenanceA')))
                }
                return h('div', {
                    class: 'maintain-cell',
                    style: {
                        display: 'flex'
                    }
                }, cell)
            }
        },
        {
            // 剎車油
            title: _this.$t('BlakeFluid'),
            key: 'blake_fluid',
            render: (h, params) => {
                const days = params.row.blake_fluid
                const cell = [h('div',
                    {
                        style: {
                            width: '55px',
                            paddingRight: '10px',
                            textAlign: 'Right'
                        }
                    }, `${days}${_this.$t('Days')}`)]
                const alert = params.row.blake_fluid_alert
                if (alert) {
                    // 保養
                    cell.push(h('Button', {
                        class: 'btn--warning',
                        props: {
                            size: 'small'
                        },
                        style: {
                            minWidth: 'unset',
                            height: '24px',
                            padding: '0 7px',
                            fontSize: '14px'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'MAINTAIN', 'BF')
                            }
                        }
                    }, _this.$t('MaintenanceA')))
                }
                return h('div', {
                    class: 'maintain-cell',
                    style: {
                        display: 'flex'
                    }
                }, cell)
            }
        },
        {
            // 機油
            title: _this.$t('EngineOil'),
            key: 'engine_oil',
            render: (h, params) => {
                const days = params.row.engine_oil
                const cell = [h('div',
                    {
                        style: {
                            width: '55px',
                            paddingRight: '10px',
                            textAlign: 'Right'
                        }
                    }, `${days}${_this.$t('Days')}`)]
                const alert = params.row.engine_oil_alert
                if (alert) {
                    // 保養
                    cell.push(h('Button', {
                        class: 'btn--warning',
                        props: {
                            size: 'small'
                        },
                        style: {
                            minWidth: 'unset',
                            height: '24px',
                            padding: '0 7px',
                            fontSize: '14px'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'MAINTAIN', 'EO')
                            }
                        }
                    }, _this.$t('MaintenanceA')))
                }
                return h('div', {
                    class: 'maintain-cell',
                    style: {
                        display: 'flex'
                    }
                }, cell)
            }
        },
        {
            // 尿素
            title: _this.$t('ExhaustFluid'),
            key: 'exhaust_fluid',
            render: (h, params) => {
                const days = params.row.exhaust_fluid
                const cell = [h('div',
                    {
                        style: {
                            width: '55px',
                            paddingRight: '10px',
                            textAlign: 'Right'
                        }
                    }, `${days}${_this.$t('Days')}`)]
                const alert = params.row.exhaust_fluid_alert
                if (alert) {
                    // 保養
                    cell.push(h('Button', {
                        class: 'btn--warning',
                        props: {
                            size: 'small'
                        },
                        style: {
                            minWidth: 'unset',
                            height: '24px',
                            padding: '0 7px',
                            fontSize: '14px'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'MAINTAIN', 'EF')
                            }
                        }
                    }, _this.$t('MaintenanceA')))
                }
                return h('div', {
                    class: 'maintain-cell',
                    style: {
                        display: 'flex'
                    }
                }, cell)
            }
        },
        {
            // 檢查中
            title: _this.$t('Checking'),
            key: 'check',
            render: (h, params) => {
                var iconType = 'md-close'
                if (params.row.check)
                    iconType = 'md-checkmark'

                return h('div', [
                    h('Icon', {
                        props: {
                            type: iconType,
                            size: '24'
                        },
                        style: {
                            color: params.row.check ? '#11b136' : '#d92020'
                        }
                    })
                ])
            }
        },
        {
            title: _this.$t('Action'),
            key: 'action',
            width: 200,
            align: 'center',
            fixed: 'right',
            render: (h, params) => {
                const btns = [
                    // 詳細資料
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'DETAIL')
                            }
                        }
                    }, _this.$t('Details')),
                    // 檢查
                    h('Button', {
                        class: 'btn--table',
                        props: {
                            size: 'default'
                        },
                        on: {
                            click: () => {
                                _this.handleModal(params.row.id, 'CHECK')
                            }
                        }
                    }, _this.$t('Check'))
                ]
                const groupBtns = h('ButtonGroup', btns)
                return groupBtns
            }
        }
    ]
}