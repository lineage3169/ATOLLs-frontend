const menu = [
    {
        // 車輛管理
        label: ['Vehicle', 'Management'],
        icon: 'ios-car',
        path: '/frontend/pm/vehicle',
        rule: 'vehicle@PM',
        isActive: false,
        isCollect: false
    },
    {
        // 車位管理
        label: ['ParkingSpace', 'Management'],
        icon: '',
        path: '/frontend/pm/parking-space',
        rule: 'parking-space@PM',
        imgFilename: 'parking.svg',
        isActive: false,
        isCollect: false
    },
    {
        // 停車區域管理
        label: 'AreaMgnt',
        icon: '',
        path: '/frontend/pm/parking-area',
        rule: 'parking-area@PM',
        imgFilename: 'parked-area.svg',
        isActive: false,
        isCollect: false
    },
    {
        // 紀錄
        label: 'LogA',
        icon: 'md-list-box',
        path: '/frontend/pm/log',
        rule: 'log@PM',
        img: true,
        isActive: false,
        isCollect: false
    },
    {
        // 系統設定
        label: ['System', 'Config'],
        icon: 'ios-cog-outline',
        path: '/frontend/pm/config',
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