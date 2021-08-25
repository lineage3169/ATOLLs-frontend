export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 保單/表單號碼
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
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            width: 250,
            optionMap: null,
            datepickerType: 'date',
            multiple: true,
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
            placeholder: _this.$t('PlaceHolder.PleaseEnter') + _this.$t('TypeCode'),
            width: 250,
            optionMap: null
        },
        {
            // 寄送類型
            label: _this.$t('MailType'),
            model: 'mail_type',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.$store.state.mailTypeNameMap
        }
    ]
}