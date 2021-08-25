import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    mode: 'history',
    base: process.env.BASE_URL,
    routes: [
        {
            path: '/login',
            name: 'Login',
            component: resolve => require(['@/router/others/login.vue'], resolve)
        },
        {
            path: '/frontend',
            meta: { requiresAuth: true },
            component: resolve => require(['@/router/index.vue'], resolve),
            children: [
                {
                    path: '/',
                    name: 'Welcome',
                    meta: { features: '*' },
                    component: resolve => require(['@/router/others/welcome.vue'], resolve)
                },
                {
                    path: 'ins/config',
                    name: 'ConfigIns',
                    meta: { features: 'config@SYS' },
                    props: { moduleType: 'INS' },
                    component: resolve => require(['@/router/config/container.vue'], resolve)
                },
                {
                    path: 'pm/config',
                    name: 'ConfigPm',
                    meta: { features: 'config@SYS' },
                    props: { moduleType: 'PM' },
                    component: resolve => require(['@/router/config/container.vue'], resolve)
                },
                {
                    path: 'backend',
                    name: 'Backend',
                    meta: { features: 'backend@SYS' },
                    component: resolve => require(['@/router/insurance/backend/container.vue'], resolve)
                },
                {
                    path: 'logout',
                    name: 'Logout',
                    meta: { features: '*' },
                    component: resolve => require(['@/router/others/logout.vue'], resolve)
                },
                {
                    path: 'account',
                    name: 'Account',
                    meta: { features: '*' },
                    props: { type: 'INS' },
                    component: resolve => require(['@/router/others/account.vue'], resolve)
                },
                {
                    path: 'pm/vehicle',
                    name: 'VehicleManagement',
                    meta: {
                        moduleType: 'PM',
                        features: 'vehicle@PM'
                    },
                    component: resolve => require(['@/router/vehicle/desktop/vehicle/container.vue'], resolve)
                },
                {
                    path: 'pm/parking-space',
                    name: 'ParkingSpaceManagement',
                    meta: {
                        moduleType: 'PM',
                        features: 'parking-space@PM'
                    },
                    component: resolve => require(['@/router/vehicle/desktop/parking-space/container.vue'], resolve)
                },
                {
                    path: 'pm/parking-area',
                    name: 'ParkingAreaManagement',
                    meta: {
                        moduleType: 'PM',
                        features: 'parking-area@PM'
                    },
                    component: resolve => require(['@/router/vehicle/desktop/parking-area/container.vue'], resolve)
                },
                {
                    path: 'pm/log',
                    name: 'VehicleLog',
                    meta: {
                        moduleType: 'PM',
                        features: 'log@PM'
                    },
                    component: resolve => require(['@/router/vehicle/desktop/log/container.vue'], resolve)
                },
                {
                    path: 'ins/search',
                    name: 'Search-INS',
                    meta: {
                        moduleType: 'INS',
                        features: 'search@INS'
                    },
                    component: resolve => require(['@/router/insurance/search/container.vue'], resolve)
                },
                {
                    path: 'ins/report',
                    name: 'Reports-INS',
                    meta: {
                        moduleType: 'INS',
                        features: 'reports@INS'
                    },
                    component: resolve => require(['@/router/insurance/reports/container.vue'], resolve)
                },
                {
                    path: 'ins/operations',
                    name: 'Operation-INS',
                    meta: {
                        moduleType: 'INS',
                        features: 'operation@INS'
                    },
                    component: resolve => require(['@/router/insurance/operations/container.vue'], resolve)
                },
                {
                    path: 'ins/recycle',
                    name: 'Recycle-INS',
                    meta: {
                        moduleType: 'INS',
                        features: 'recycle@INS'
                    },
                    component: resolve => require(['@/router/insurance/recycle/container.vue'], resolve)
                },
                {
                    path: 'ins/factory',
                    name: 'Factory',
                    meta: {
                        moduleType: 'INS',
                        features: 'factory@INS'
                    },
                    component: resolve => require(['@/router/insurance/factory/container.vue'], resolve)
                }
            ]
        },
        {
            path: '/m-frontend',
            meta: {
                requiresAuth: true,
                features: 'mobile@PM'
            },
            component: resolve => require(['@/router/m-index.vue'], resolve),
            children: [
                {
                    path: '/',
                    name: 'Index-m-PM',
                    meta: { features: 'mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/main.vue'], resolve)
                },
                {
                    path: 'vehicle/search',
                    name: 'Vehicle-Search-m-PM',
                    meta: { features: 'vehicle-search@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/vehicle-search.vue'], resolve)
                },
                {
                    path: 'parking-space/create',
                    name: 'Parking-Space-Create-m-PM',
                    meta: { features: 'ps-create@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/parking-space-create.vue'], resolve)
                },
                {
                    path: 'vehicle/create',
                    name: 'Vehicle-Create-m-PM',
                    meta: { features: 'vehicle-create@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/vehicle-create.vue'], resolve)
                },
                {
                    path: 'move-in',
                    name: 'Move-In-m-PM',
                    meta: { features: 'move-in@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/move-in.vue'], resolve)
                },
                {
                    path: 'parking-space/search',
                    name: 'Parking-Space-Search-m-PM',
                    meta: { features: 'ps-search@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/parking-space-search.vue'], resolve)
                },
                {
                    path: 'parking-space/remaining',
                    name: 'Parking-Space-Remaining-m-PM',
                    meta: { features: 'remaining@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/parking-space-remaining.vue'], resolve)
                },
                {
                    path: 'vehicle/operation',
                    name: 'Vehicle-Operation-m-PM',
                    meta: { features: 'vehicle-operation@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/vehicle-operation.vue'], resolve)
                },
                {
                    path: 'vehicle/leaving',
                    name: 'Vehicle-Leaving-m-PM',
                    meta: { features: 'leaving@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/vehicle-leaving.vue'], resolve)
                },
                {
                    path: 'vehicle/maintenance',
                    name: 'Vehicle-Maintenance-m-PM',
                    meta: { features: 'maintenance@mobile@PM' },
                    component: resolve => require(['@/router/vehicle/mobile/vehicle-maintenance.vue'], resolve)
                },
                {
                    path: 'config',
                    name: 'config-m-PM',
                    meta: { features: 'config@mobile@PM' },
                    props: { type: 'PM' },
                    component: resolve => require(['@/router/others/account.vue'], resolve)
                },
                {
                    path: 'logout',
                    name: 'Logout-m-PM',
                    meta: { features: '*' },
                    component: resolve => require(['@/router/others/logout.vue'], resolve)
                }
            ]
        },
        {
            path: '*',
            redirect: () => {
                const sotrageData = localStorage.getItem('atolls-isMobile')
                const isMobile = sotrageData ? JSON.parse(sotrageData) : false
                if (isMobile) return '/m-frontend'
                else return '/frontend'
            }
        }
    ]
})