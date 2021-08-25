export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 保單 / 表單號碼
            label: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            model: 'object_name',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.PleaseTypePolicy'),
            width: 250,
            optionMap: null
        },
        {
            // 批次日期
            label: _this.$t('Batch') + _this.$t('Date'),
            model: 'cycle_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectPeriod'),
            width: 250,
            optionMap: null,
            datepickerType: 'daterange',
            func: _this.setCycleDate
        },
        {
            // 業務來源
            label: _this.$t('BusinessSource'),
            model: 'billing_category',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.billCateNameMap
        },
        {
            // 業務關聯代碼
            label: _this.$t('BusinessAssociation') + _this.$t('Code'),
            model: 'unit_id',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.BusinessAssociation'),
            width: 250,
            optionMap: null
        },
        {
            // 通路
            label: _this.$t('ChannelA'),
            model: 'channel',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.channelNameMap
        },
        {
            // 狀態
            label: _this.$t('Status'),
            model: 'status',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.statusNameMap
        },
        {
            // 批次類型
            label: _this.$t('Batch') + _this.$t('TypeA'),
            model: 'cycle_type',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.cycleTypeNameMap
        },
        {
            // 險種代碼
            label: _this.$t('TypeCode'),
            model: 'type_code',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.PleaseEnter') +
                        _this.$t('TypeCode'),
            width: 250,
            optionMap: null
        },
        {
            // 郵寄方式
            label: _this.$t('PostingService'),
            model: 'posting_service',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.postNameMap
        },
        {
            // 契約始期
            label: _this.$t('EffectiveDate'),
            model: 'effective_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectPeriod'),
            width: 250,
            optionMap: null,
            multiple: true,
            func: _this.setEffectiveDate
        },
        {
            // 郵寄日期
            label: _this.$t('MailDate'),
            model: 'mail_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            width: 250,
            optionMap: null,
            datepickerType: 'date',
            multiple: true,
            func: _this.setMailDates
        },
        {
            // 工單編號
            label: _this.$t('Order') + _this.$t('ID'),
            model: 'order_id',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.PleaseEnter') +
                         _this.$t('Complete') +
                         _this.$t('Order') +
                         _this.$t('ID'),
            width: 250,
            optionMap: null
        },
        {
            // 委外公司
            label: _this.$t('Outsourcing') + _this.$t('Company'),
            model: 'outsourcing_id',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.outsourcingList
        },
        {
            // 寄送類型
            label: _this.$t('MailType'),
            model: 'mail_type',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.mailTypeNameMap
        },
        {
            // 有無變更地址
            label: _this.$t('Has') +
                _this.$t('Change') +
                _this.$t('Address'),
            model: 'isUpdatedAddress',
            type: 'switch',
            width: 250
        }
    ]
}