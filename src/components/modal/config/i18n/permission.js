export default function(data = null) {
    const _this = data
    if (!_this) return {}
    return {
        'api-test': _this.$t('Test'),
        'area-mgnt': _this.$t('AreaMgnt'),
        automation: _this.$t('Automation'),
        backend: _this.$t('Backend'),
        base: _this.$t('Search'),
        config: _this.$t('Config'),
        'data-group': _this.$t('Data') + _this.$t('Groups') + _this.$t('Setting'),
        'delete-order': _this.$t('Delete') + _this.$t('Order'),
        dispatch: _this.$t('Dispatch') + _this.$t('Setting'),
        edit: _this.$t('Edit'),
        factory: _this.$t('OperationB'),
        general: _this.$t('General'),
        hardwords: _this.$t('Hardwords') + _this.$t('Upload'),
        INS: `${_this.$t('Insurance')}${_this.$t('Management')}${_this.$t('Module')}`,
        leaving: _this.$t('LeavingCarBarn'),
        license: _this.$t('License'),
        log: _this.$t('LogA'),
        maintenance: _this.$t('ToBeMaintenanced'),
        mobile: _this.$t('Mobile'),
        'move-in': _this.$t('MoveIn') + _this.$t('ParkingSpace'),
        notice: _this.$t('NoticeA'),
        'notice-group': _this.$t('GroupNotice'),
        'object-log': _this.$t('Object') + _this.$t('Log'),
        operation: _this.$t('Operations'),
        'operation-list': _this.$t('OperationA') + _this.$t('List'),
        operationB: _this.$t('OperationB'),
        'order-code': _this.$t('Order') + _this.$t('Confirm'),
        'order-search': _this.$t('Order') + _this.$t('Search'),
        'package-update': _this.$t('Package') + _this.$t('Update'),
        'parking-area': _this.$t('AreaMgnt'),
        'parking-mgmt': _this.$t('Parking') + _this.$t('Management'),
        'parking-space': _this.$t('ParkingSpace') + _this.$t('Management'),
        'pending-list': _this.$t('Pending') + _this.$t('ListA'),
        PM: `${_this.$t('Parking')}${_this.$t('Management')}${_this.$t('Module')}`,
        'progress-check': _this.$t('Progress') + _this.$t('Check'),
        'progress-update': _this.$t('Progress') + _this.$t('Update'),
        'ps-create': _this.$t('Create') + _this.$t('ParkingSpace'),
        'ps-search': _this.$t('ParkingSpace') + _this.$t('Search'),
        recycle: _this.$t('Recycle'),
        remaining: `${_this.$t('View')}${_this.$t('Remaining')}${_this.$t('ParkingSpace')}`,
        reports: _this.$t('Report'),
        sample: _this.$t('Sample'),
        search: _this.$t('Search'),
        SYS: _this.$t('System'),
        'system-config': _this.$t('Config'),
        'system-log': _this.$t('System') + _this.$t('Log'),
        'system-user': _this.$t('User'),
        user: _this.$t('User'),
        valuation: _this.$t('Valuation'),
        vehicle: _this.$t('Vehicle') + _this.$t('Management'),
        'vehicle-create': _this.$t('Create') + _this.$t('VehicleInfo'),
        'vehicle-operation': _this.$t('Vehicle') + _this.$t('Operation'),
        'vehicle-search': _this.$t('Vehicle') + _this.$t('Search'),
        'welcome-page': `${_this.$t('Data')}${_this.$t('Groups')}${_this.$t('Setting')}`,
        'working-day': _this.$t('WorkingDay') + _this.$t('Config')
    }
}