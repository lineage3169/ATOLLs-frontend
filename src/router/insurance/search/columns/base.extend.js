export default function(data = null) {
    const _this = data
    if (!_this) return []
    return [
        {
            // 保單號碼
            title: _this.$t('InsPolicy&Form') + _this.$t('NumberA'),
            key: 'name'
        },
        {
            // 要保人
            title: _this.$t('PolicyOwnerName'),
            key: 'policy_owner_name'
        },
        {
            // 被保人
            title: _this.$t('InsuredName'),
            key: 'insured_name'
        },
        {
            // 批次日期
            title: _this.$t('Batch') + _this.$t('Date'),
            key: 'cycle_date'
        },
        {
            // 發單類別
            title: _this.$t('BillingA') + _this.$t('CategoryA'),
            key: 'billing_category'
        },
        {
            // 險種代碼
            title: _this.$t('TypeCode'),
            key: 'type_code'
        },
        {
            // 狀態
            title: _this.$t('Status'),
            key: 'status'
        },
        {
            // 備註
            title: _this.$t('Remarks'),
            key: 'remarks'
        },
        {
            // 批次類型
            title: _this.$t('Batch') + _this.$t('TypeA'),
            key: 'cycle_type'
        },
        {
            // 掛號單碼
            title: _this.$t('RegisterNumber'),
            key: 'register_number'
        },
        {
            // 歸戶碼
            title: _this.$t('PackageCode'),
            key: 'package_code'
        },
        {
            // 郵寄日期
            title: _this.$t('MailDate'),
            key: 'mail_date'
        },
        {
            // 通路
            title: _this.$t('ChannelA'),
            key: 'channel'
        },
        {
            // 業務關聯代碼
            title: _this.$t('BusinessAssociation') + _this.$t('Code'),
            key: 'unit_id'
        },
        {
            // 單位名稱
            title: _this.$t('Unit') + _this.$t('Name'),
            key: 'unit_name'
        },
        {
            // 收件職場
            title: _this.$t('ReceivingWorkplace'),
            key: 'in_factory'
        },
        {
            // 收件人
            title: _this.$t('RecipientA'),
            key: 'recipient'
        },
        {
            // 收件人地址
            title: _this.$t('RecipientA') + _this.$t('Address'),
            key: 'recipient_address'
        },
        {
            // 交寄類型
            title: _this.$t('MailType'),
            key: 'mail_type'
        },
        {
            // 海卡
            title: _this.$t('Haika'),
            key: 'Haika'
        },
        {
            // 契約始期
            title: _this.$t('EffectiveDate'),
            key: 'effective_date'
        },
        {
            // 郵寄方式
            title: _this.$t('PostingService'),
            key: 'posting_service'
        },
        {
            // 進度
            title: _this.$t('Progress'),
            key: 'progress'
        },
        {
            // 經手人姓名
            title: _this.$t('AgentB') + _this.$t('Name'),
            key: 'agt_name'
        }
    ]
}