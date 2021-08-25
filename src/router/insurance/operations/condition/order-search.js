export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            label: _this.$t('Date'),
            model: 'date_range',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            width: 250,
            optionMap: null,
            datepickerType: 'daterange',
            multiple: false,
            func: _this.setDates
        },
        {
            label: `${_this.$t('Order')}${_this.$t('ID')}`,
            model: 'order_id',
            type: 'text',
            placeholder: `${_this.$t('PlaceHolder.PleaseEnter')}${_this.$t('Order')}${_this.$t('ID')}`,
            width: 250,
            optionMap: null
        },
        {
            label: `${_this.$t('Outsourcing')}${_this.$t('Company')}${_this.$t('English')}${_this.$t('Abbreviation')}`,
            model: 'outsourcing_name',
            type: 'text',
            placeholder: `${_this.$t('PlaceHolder.PleaseTypeAbbreviation')}`,
            width: 250,
            optionMap: null
        }
    ]
}