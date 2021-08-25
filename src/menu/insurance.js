const menu = [
    {
        // 查詢
        label: 'Search',
        icon: 'md-search',
        path: '/frontend/ins/search',
        rule: 'search@INS',
        isActive: false,
        isCollect: false
    },
    {
        // 報表
        label: 'Report',
        icon: 'md-clipboard',
        path: '/frontend/ins/report',
        rule: 'reports@INS',
        isActive: false,
        isCollect: false
    },
    // {
    //     // 日誌
    //     label: 'Log',
    //     icon: 'md-list-box',
    //     path: '/frontend/ins/log',
    //     rule: 'log',
    //     isActive: false,
    //     isCollect: false
    // },
    {
        // 生產
        label: 'Operations',
        icon: 'md-build',
        path: '/frontend/ins/operations',
        rule: 'operation@INS',
        isActive: false,
        isCollect: false
    },
    {
        // 資源回收
        label: 'Recycle',
        icon: 'md-trash',
        path: '/frontend/ins/recycle',
        class: '',
        rule: 'recycle@INS',
        isActive: false,
        isCollect: false
    },
    {
        // 操作
        label: 'OperationB',
        icon: 'ios-construct',
        path: '/frontend/ins/factory',
        rule: 'factory@INS',
        isActive: false,
        isCollect: false
    },
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