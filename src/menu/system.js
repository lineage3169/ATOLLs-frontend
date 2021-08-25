const menu = [
    {
        // 系統設定
        label: ['System', 'Config'],
        icon: 'ios-cog-outline',
        path: '/frontend/ins/config',
        rule: 'config@SYS',
        isActive: false,
        isCollect: false
    },
    {
        // 測試
        label: 'Test',
        icon: 'ios-flask-outline',
        path: '/frontend/backend',
        rule: 'backend@SYS',
        isActive: false,
        isCollect: false
    },
    {
        // 帳號
        label: 'Account',
        icon: 'ios-contact',
        path: '/frontend/account',
        type: 'ACCOUNT',
        rule: '*',
        isActive: false,
        isCollect: false
    },
    {
        // 登出
        label: 'Logout',
        icon: 'md-exit',
        type: 'ACCOUNT',
        rule: '*',
        path: '/frontend/logout',
        isActive: false,
        isCollect: false
    }
]
export default menu