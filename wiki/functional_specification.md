# Functional Specification

> Permission rule: Tab@Menu@Module

## 壽險模組
### 查詢
`frontend/ins/search`

| Feature                                               | Path                                           | Permission                |
| ----------------------------------------------------- | ---------------------------------------------- | ------------------------- |
| [查詢](spec/insurance/search/search.md)             | src/router/insurance/search/base.vue           | base@search@INS           |
| [操作](spec/insurance/search/operation.md)          | src/router/insurance/search/operation-list.vue | operation@search@INS      |
| [作業序列](spec/insurance/search/operation-list.md) | src/router/insurance/search/operation.vue      | operation-list@search@INS |
| [抽樣檢查](spec/insurance/search/sample.md)         | src/router/insurance/search/sampling.vue       | sample@search@INS         |

### 報表
`frontend/ins/report`

| Feature                                               | Path                                       | Permission            |
| ----------------------------------------------------- | ------------------------------------------ | --------------------- |
| [發單價格總表](spec/insurance/reports/valuation.md) | src/router/insurance/reports/valuation.vue | valuation@reports@INS |

### 生產
> 針對委外廠商作業管理

`frontend/ins/operations `

| Feature                                                  | Path                                             | Permission                 |
| -------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| [派送設定](spec/insurance/operations/dispatch.md)      | src/router/insurance/operations/dispatch.vue     | dispatch@operation@INS     |
| [工單查詢](spec/insurance/operations/order-search.md)  | src/router/insurance/operations/order-search.vue | order-search@operation@INS |
| [工作日設定](spec/insurance/operations/working-day.md) | src/router/insurance/operations/working-day.vue  | working-day@operation@INS  |
| [工單確認](spec/insurance/operations/order-code.md)    | src/router/insurance/operations/order-code.vue   | order-code@operation@INS   |
| [計價管理](spec/insurance/operations/valuation.md)     | src/router/insurance/operations/valuation.vue    | valuation@operation@INS    |

### 資源回收
`frontend/ins/recycle`

| Feature                                              | Path                                          | Permission               |
| ---------------------------------------------------- | --------------------------------------------- | ------------------------ |
| [刪除工單](spec/insurance/recycle/delete-order.md) | src/router/insurance/recycle/delete-order.vue | delete-order@recycle@INS |

### 操作
> 委外廠商使用

`frontend/ins/factory`

| Feature                                                 | Path                                             | Permission                 |
| ------------------------------------------------------- | ------------------------------------------------ | -------------------------- |
| [進度更新](spec/insurance/factory/progress-update.md) | src/router/insurance/factory/progress-update.vue | dispatch@operation@INS     |
| [裝封更新](spec/insurance/factory/package-update.md)  | src/router/insurance/factory/package-update.vue  | order-search@operation@INS |
| [進度檢查](spec/insurance/factory/progress-check.md)  | src/router/insurance/factory/progress-check.vue  | working-day@operation@INS  |
| [待處理清單](spec/insurance/factory/pending-list.md)  | src/router/insurance/factory/pending-list.vue    | order-code@operation@INS   |
| [計價設定](spec/insurance/factory/valuation.md)       | src/router/insurance/factory/valuation.vue       | valuation@operation@INS    |

## 存車中心模組

### 車輛管理
`frontend/pm/vehicle`

| Feature                                                          | Path                                                   | Permission             |
| ---------------------------------------------------------------- | ------------------------------------------------------ | ---------------------- |
| [查詢](spec/parking-mgnt/desktop/vehicle/search.md)            | src/router/vehicle/desktop/vehicle/search-and-edit.vue | search@vehicle@PM      |
| [編輯](spec/parking-mgnt/desktop/vehicle/edit.md)              | src/router/vehicle/desktop/vehicle/search-and-edit.vue | edit@vehicle@PM        |
| [待保養車輛](spec/parking-mgnt/desktop/vehicle/maintenance.md) | src/router/vehicle/desktop/vehicle/maintenance.vue     | maintenance@vehicle@PM |

### 車位管理
`frontend/pm/parking-space`

| Feature                                                     | Path                                                | Permission              |
| ----------------------------------------------------------- | --------------------------------------------------- | ----------------------- |
| [查詢](spec/parking-mgnt/desktop/parking-space/search.md) | src/router/vehicle/desktop/parking-space/search.vue | search@parking-space@PM |

### 停車區域管理
`frontend/pm/parking-area`

| Feature                                                                  | Path                                                     | Permission              |
| ------------------------------------------------------------------------ | -------------------------------------------------------- | ----------------------- |
| [檢視剩餘車位](spec/parking-mgnt/desktop/parking-area/remaining-ps.md) | src/router/vehicle/desktop/parking-area/remaining-ps.vue | search@parking-space@PM |
| [停車區域管理](spec/parking-mgnt/desktop/parking-area/area-mgnt.md)    | src/router/vehicle/desktop/parking-area/area-mgnt.vue    | search@parking-space@PM |

### 紀錄
`frontend/pm/log`

| Feature                                           | Path                                    | Permission  |
| ------------------------------------------------- | --------------------------------------- | ----------- |
| [使用者](spec/parking-mgnt/desktop/log/user.md) | src/router/vehicle/desktop/log/user.vue | user@log@PM |

### 行動裝置版

| Feature  | URL                                |
| -------- | ---------------------------------- |
| 建立車籍 | m-frontend/vehicle/create          |
| 剩餘車位 | m-frontend/parking-space/remaining |
| 移入車位 | m-frontend/move-in                 |
| 車輛查詢 | m-frontend/vehicle/search          |
| 車輛作業 | m-frontend/vehicle/operation       |
| 車位查詢 | m-frontend/parking-space/search    |
| 建立車位 | m-frontend/parking-space/create    |
| 出庫     | m-frontend/vehicle/leaving         |
| 車輛保養 | m-frontend/vehicle/maintenance     |
| 設定     | m-frontend/config                  |


| Feature                                                           | Path                                                           | Permission                  |
| ----------------------------------------------------------------- | -------------------------------------------------------------- | --------------------------- |
| [建立車籍](spec/parking-mgnt/mobile/vehicle-create.md)          | src/router/vehicle/mobile/vehicle-create.vue                   | vehicle-create@mobile@PM    |
| [剩餘車位](spec/parking-mgnt/mobile/parking-space-remaining.md) | frontend/src/router/vehicle/mobile/parking-space-remaining.vue | remaining@mobile@PM         |
| [移入車位](spec/parking-mgnt/mobile/move-in.md)                 | frontend/src/router/vehicle/mobile/move-in.vue                 | move-in@mobile@PM           |
| [車輛查詢](spec/parking-mgnt/mobile/vehicle-search.md)          | frontend/src/router/vehicle/mobile/vehicle-search.vue          | vehicle-search@mobile@PM    |
| [車輛作業](spec/parking-mgnt/mobile/vehicle-operation.md)       | frontend/src/router/vehicle/mobile/vehicle-operation.vue       | vehicle-operation@mobile@PM |
| [車位查詢](spec/parking-mgnt/mobile/parking-space-search.md)    | frontend/src/router/vehicle/mobile/parking-space-search.vue    | ps-search@mobile@PM         |
| [建立車位](spec/parking-mgnt/mobile/parking-space-create.md)    | frontend/src/router/vehicle/mobile/parking-space-create.vue    | ps-create@mobile@PM         |
| [出庫](spec/parking-mgnt/mobile/vehicle-leaving.md)             | frontend/src/router/vehicle/mobile/vehicle-leaving.vue         | leaving@mobile@PM           |
| [車輛保養](spec/parking-mgnt/mobile/vehicle-maintenance.md)     | frontend/src/router/vehicle/mobile/vehicle-maintenance.vue     | maintenance@mobile@PM       |
| [設定](spec/parking-mgnt/mobile/config.md)                      | frontend/src/router/others/account.vue                         | config@mobile@PM            |

## 系統與通用

### 系統設定
`frontend/pm/config`

| Feature                                          | Path                                        | Permission              |
| ------------------------------------------------ | ------------------------------------------- | ----------------------- |
| [使用者](spec/config/system-user.md)           | frontend/src/router/config/system-user.vue  | system-user@config@SYS  |
| [資料群組設定(INS)](spec/config/data-group.md) | frontend/src/router/config/data-group.vue   | data-group@config@SYS   |
| [通知群組(INS)](spec/config/notice-group.md)   | frontend/src/router/config/notice-group.vue | notice-group@config@SYS |
| [難字上傳(INS)](spec/config/hardwords.md)      | frontend/src/router/config/hardwords.vue    | hardwords@config@SYS    |
| [單位設定(PM)](spec/config/data-group.md)      | frontend/src/router/config/data-group.vue   | data-group@config@SYS   |
| [歡迎頁設定(PM)](spec/config/welcome-page.md)  | frontend/src/router/config/welcome-page.vue | welcome-page@config@SYS |
| [授權](spec/config/license.md)                 | frontend/src/router/config/license.vue      | license@config@SYS      |

### 通用

| Feature | URL                                |
| ------- | ---------------------------------- |
| 帳號    | frontend/account                   |
| 登入    | login                              |
| 登出    | frontend/logout, m-frontend/logout |

| Feature                   | Path                                   | Permission |
| ------------------------- | -------------------------------------- | ---------- |
| [帳號](spec/account.md) | frontend/src/router/others/account.vue | *          |
| [登入](spec/login.md)   | frontend/src/router/others/login.vue   | *          |
| [登出](spec/logout.md)  | frontend/src/router/others/logout.vue  | *          |