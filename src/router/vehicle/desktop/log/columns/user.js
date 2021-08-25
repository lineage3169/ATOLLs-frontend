export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            title: _this.$t('Date'),
            width: 180,
            key: 'create_time'
        },
        {
            title: _this.$t('Level'),
            key: 'level',
            width: 100,
            render: (h, params) => {
                return h('p', _this.levelMap[params.row.level])
            }
        },
        {
            title: 'IP',
            width: 150,
            key: 'ip'
        },
        {
            title: _this.$t('User'),
            width: 150,
            key: 'user'
        },
        {
            title: _this.$t('Message'),
            key: 'message'
        }
    ]
}