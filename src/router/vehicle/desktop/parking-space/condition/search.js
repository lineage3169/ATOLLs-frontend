export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 停車區域
            label: _this.$t('ParkingArea'),
            model: 'pg_id',
            type: 'select',
            placeholder: _this.$t('PlaceHolder.PleaseChoose'),
            width: 250
        },
        {
            // 車位識別碼
            label: `${_this.$t('ParkingSpace')}${_this.$t('IDA')}`,
            model: 'search_id',
            type: 'text',
            placeholder: _this.$t('PlaceHolder.PleaseTypePSID'),
            width: 250
        }
    ]
}