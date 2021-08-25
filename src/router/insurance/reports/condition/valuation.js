export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            label: _this.$t('Outsourcing') + _this.$t('Company'),
            model: 'outsourcingID',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.outsourcingList
        },
        {
            label: _this.$t('MailDate'),
            model: 'mail_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectPeriod'),
            width: 250,
            optionMap: null,
            datepickerType: 'daterange',
            func: _this.setMailDate
        },
        {
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
            label: _this.$t('BusinessSource'),
            model: 'billingCategory',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250,
            optionMap: _this.billCateNameMap,
            clearable: false
        }
    ]
}