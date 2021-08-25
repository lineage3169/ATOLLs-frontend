export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 工單編號
            title: `${_this.$t('Order')}${_this.$t('ID')}`,
            key: 'order_id'
        },
        {
            // 公司英文簡稱
            title: `${_this.$t('Outsourcing')}${_this.$t('Company')}${_this.$t('English')}${_this.$t('Abbreviation')}`,
            key: 'name',
            sortable: true
        },
        {
            // 公司別名
            title: `${_this.$t('Outsourcing')}${_this.$t('Company')}${_this.$t('Alias')}`,
            key: 'alias'
        },
        {
            // 建立日期
            title: `${_this.$t('Create')}${_this.$t('Date')}`,
            key: 'create_time',
            sortable: true
        }
    ]
}