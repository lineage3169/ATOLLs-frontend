export default function(data = null) {
    if (!data) return []
    const _this = data
    return [
        {
            // 全部
            value: 'all',
            label: _this.$t('All')
        },
        {
            // 變更
            value: 'change',
            label: _this.$t('ChangeA')
        },
        {
            // 未刷
            value: 'none_all',
            label: _this.$t('Unscanned')
        },
        {
            // 已刷(未依指定)
            value: 'user_conflict',
            label: `${_this.$t('Scanned')}(${_this.$t('NotFollow')})`
        },
        {
            // 未刷(變更)
            value: 'none_change',
            label: `${_this.$t('Unscanned')}(${_this.$t('ChangeA')})`
        },
        {
            // 未刷(應放行)
            value: 'none_change_normal',
            label: `${_this.$t('Unscanned')}(${_this.$t('ReleaseB')})`
        },
        {
            // 未刷(應驗退)
            value: 'none_change_reject',
            label: `${_this.$t('Unscanned')}(${_this.$t('RejectB')})`
        },
        {
            // 未刷(應抽件)
            value: 'none_change_pickout',
            label: `${_this.$t('Unscanned')}(${_this.$t('PickoutB')})`
        },
        {
            // 已刷
            value: 'user_all',
            label: _this.$t('Scanned')
        },
        {
            // 已刷(放行)
            value: 'user_normal',
            label: `${_this.$t('Scanned')}(${_this.$t('ReleaseA')})`
        },
        {
            // 已刷(驗退)
            value: 'user_reject',
            label: `${_this.$t('Scanned')}(${_this.$t('RejectA')})`
        },
        {
            // 已刷(抽件)
            value: 'user_picker',
            label: `${_this.$t('Scanned')}(${_this.$t('PickOutA')})`
        }
    ]
}