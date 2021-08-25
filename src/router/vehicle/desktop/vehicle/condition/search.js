export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 建立日期
            label: _this.$t('Create') + _this.$t('Date'),
            model: 'create_dates',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            datepickerType: 'daterange',
            width: 250,
            func: _this.setDates
        },
        {
            // 生產/底盤編號、QRcode
            label: `${_this.$t('Produce')}/${_this.$t('Chassis')}${_this.$t('ID')}、QRcode`,
            model: 'search_id',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.TypeKeyword'),
            width: 250
        },
        {
            // 配額單位
            label: _this.$t('Quota') + _this.$t('Unit'),
            model: 'quota',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250
        },
        {
            // 待複檢
            label: _this.$t('Reconfirm'),
            model: 'reconfirm',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250
        },
        {
            // 到港日期
            label: _this.$t('ArrivalDate'),
            model: 'arrival_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            datepickerType: 'daterange',
            width: 250,
            func: _this.setDates
        },
        {
            // 出庫時間
            label: _this.$t('LeaveGarageDate'),
            model: 'leave_garage_date',
            type: 'datepicker',
            placeholder: _this.$t('PlaceHolder.SelectDate'),
            datepickerType: 'daterange',
            width: 250,
            func: _this.setDates
        }
    ]
}