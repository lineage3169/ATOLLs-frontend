const menu = [
    // 建立車籍
    {
        icon: 'ios-car',
        label: ['Create', 'VehicleInfo'],
        rule: 'vehicle-create@mobile@PM',
        path: 'vehicle/create'
    },
    // 剩餘車位
    {
        icon: '',
        imgFilename: 'parking.svg',
        label: ['Remaining', 'ParkingSpace'],
        rule: 'remaining@mobile@PM',
        path: 'parking-space/remaining'
    },
    // 移入車位
    {
        icon: 'md-log-in',
        label: ['MoveIn', 'ParkingSpace'],
        rule: 'move-in@mobile@PM',
        path: 'move-in'
    },
    // 車輛查詢
    {
        icon: 'md-locate',
        label: ['Vehicle', 'Search'],
        rule: 'vehicle-search@mobile@PM',
        path: 'vehicle/search'
    },
    // 車輛作業
    {
        icon: 'ios-construct',
        label: ['Vehicle', 'Operation'],
        rule: 'vehicle-operation@mobile@PM',
        path: 'vehicle/operation'
    },
    // 車位查詢
    {
        icon: 'md-search',
        label: ['ParkingSpace', 'Search'],
        rule: 'ps-search@mobile@PM',
        path: 'parking-space/search'
    },
    // 建立車位
    {
        icon: 'md-add',
        label: ['Create', 'ParkingSpace'],
        rule: 'ps-create@mobile@PM',
        path: 'parking-space/create'
    },
    // 出庫
    {
        icon: 'ios-log-out',
        label: 'LeavingCarBarn',
        rule: 'leaving@mobile@PM',
        path: 'vehicle/leaving'
    },
    // 車輛保養
    {
        icon: 'ios-build',
        label: ['Vehicle', 'MaintenanceA'],
        rule: 'maintenance@mobile@PM',
        path: 'vehicle/maintenance'
    },
    // 設定
    {
        icon: 'ios-cog-outline',
        label: 'Config',
        rule: 'config@mobile@PM',
        path: 'config'
    }
]
export default menu