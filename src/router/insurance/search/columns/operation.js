export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 保單/表單號碼
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'name',
            width: 140,
            fixed: 'left'
        },
        {
            // 批次日期
            title: _this.$t('Batch') + _this.$t('Date'),
            key: 'cycle_date',
            minWidth: 120,
            render: (h, params) => {
                return h('div', _this.convertDateToDisplay(params.row.cycle_date))
            }
        },
        {
            // 業務來源
            title: _this.$t('BusinessSource'),
            key: 'billing_category',
            minWidth: 110,
            render: (h, params) => {
                return h('p', _this.billCateNameMap[params.row.billing_category])
            }
        },
        {
            // 寄送類型
            title: _this.$t('MailType'),
            key: 'mail_type',
            render: (h, params) => {
                return h('p', _this.mailTypeNameMap[params.row.mail_type])
            },
            minWidth: 130
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
            minWidth: 140
        },
        {
            // 通路
            title: _this.$t('ChannelA'),
            key: 'channel',
            render: (h, params) => {
                return h('p', _this.channelNameMap[params.row.channel])
            },
            minWidth: 140
        },
        {
            // 狀態
            title: _this.$t('Status'),
            key: 'status',
            render: (h, params) => {
                return h('p', _this.statusNameMap[params.row.status])
            },
            minWidth: 110
        },
        {
            // 批次類型
            title: _this.$t('Batch') + _this.$t('TypeA'),
            key: 'cycle_type',
            render: (h, params) => {
                return h('p', _this.cycleTypeNameMap[params.row.cycle_type])
            },
            minWidth: 110
        },
        {
            title: _this.$t('OperationA'),
            key: 'operation',
            align: 'center',
            fixed: 'right',
            width: 450,
            render: (h, params) => {
                // 狀態為正常件，才可以抽件
                let pickOutDiasble = true // 抽件
                let changeAddDisable = true // 變更地址
                let releaseDiasble = true // 放行
                let crDisable = true // 驗退
                let pdfDiasble = false // PDF
                switch (params.row.status) {
                case 'N': // 正常件 (可抽件、變更地址、驗退)
                    pickOutDiasble = false
                    changeAddDisable = false
                    crDisable = false
                    break
                case 'CR': // 驗退 (可放行)
                    releaseDiasble = false
                    break
                case 'P': // 抽件 (可抽件、變更地址、放行、驗退)
                    pickOutDiasble = false
                    changeAddDisable = false
                    releaseDiasble = false
                    crDisable = false
                    break
                default:
                    break
                }
                // 還未轉檔將下載鈕鎖定
                if (params.row.progress === 'RC') pdfDiasble = true
                // 至今超過7天 屏蔽PDF
                if (params.row.meta.Flag && params.row.meta.Flag.PDF_REMOVED === true)
                    pdfDiasble = true
                // 於作業序列中
                if (params.row.isInQueue === true) {
                    pickOutDiasble = true
                    releaseDiasble = true
                    crDisable = true
                    changeAddDisable = true
                }

                const allBtns = [
                    h('Button', {
                        props: {
                            type: 'dashed',
                            size: 'default',
                            disabled: pickOutDiasble
                        },
                        on: {
                            click: () => {
                                _this.handleOperation(params.index, 'PickOut')
                            }
                        }
                    }, _this.$t('PickOutA')),
                    h('Button', {
                        props: {
                            type: 'dashed',
                            size: 'default',
                            disabled: changeAddDisable
                        },
                        on: {
                            click: () => {
                                _this.handleOperation(params.index, 'ChangeAddress')
                            }
                        }
                    }, _this.$t('Change') + _this.$t('Address')),
                    h('Button', {
                        props: {
                            type: 'dashed',
                            size: 'default',
                            disabled: releaseDiasble
                        },
                        on: {
                            click: () => {
                                _this.handleOperation(params.index, 'Release')
                            }
                        }
                    }, _this.$t('ReleaseA')),
                    h('Button', {
                        props: {
                            type: 'dashed',
                            size: 'default',
                            disabled: crDisable
                        },
                        on: {
                            click: () => {
                                _this.handleOperation(params.index, 'CheckAndReject')
                            }
                        }
                    }, _this.$t('CheckAndReject')),
                    h('Button', {
                        props: {
                            type: 'dashed',
                            size: 'default',
                            disabled: pdfDiasble
                        },
                        on: {
                            click: () => {
                                _this.handleDownload(params.index)
                            }
                        }
                    }, 'PDF')
                ]
                // 於作業序列中
                if (params.row.isInQueue) {
                    return h('div',
                        [h('Tooltip', {
                            props: {
                                content: _this.$t('InQueue'),
                                transfer: true,
                                placement: 'left',
                                theme: 'light'
                            }
                        }, allBtns)]
                    )
                }
                else
                    return h('div', allBtns)
            }
        }
    ]
}