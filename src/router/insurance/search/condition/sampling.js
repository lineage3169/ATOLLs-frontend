export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            label: _this.$t('Upload') + _this.$t('File'),
            model: 'file',
            type: 'file',
            width: 250,
            fileMaxSize: 3 * 1024,
            help: _this.$t('Tooltips.Sample.UploadFile')
        },
        {
            label: `${_this.$t('Order')}${_this.$t('ID')}`,
            model: 'orderID',
            type: 'text',
            placeholder: `${_this.$t('PlaceHolder.PleaseEnter')}${_this.$t('Order')}${_this.$t('ID')}`,
            width: 250
        },
        {
            label: `${_this.$t('Object')}${_this.$t('ID')}`,
            model: 'objectName',
            type: 'text',
            placeholder: `${_this.$t('PlaceHolder.PleaseEnter')}${_this.$t('Object')}${_this.$t('ID')}`,
            width: 250,
            help: _this.$t('Tooltips.Sample.ObjectID')
        }
    ]
}