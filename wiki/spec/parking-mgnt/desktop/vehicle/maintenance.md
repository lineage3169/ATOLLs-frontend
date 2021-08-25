# 車輛管理 - 待保養車輛

## 功能
* 提供車輛需保養之提醒介面
* 保養需輸入生產編號末五碼當作確認
* 任何保養皆在五天前提醒


## 查詢條件、欄位名稱
| 項目     | API Parameters   | 說明                               |
| -------- | ---------------- | -------------------------------- |
| 生產編號 | origin_id        | 該車輛的生產編號                     |
| 底盤編號 | name             | 該車輛的底盤編號                     |
| QRcode   | barcode          | 該車輛的QRcode                    |
| 車輛維護 | vehicle_maintain | 初始依建檔日期 30天 需更換           |
| 剎車油   | blake_fluid      | 初始依到港日期 180天 (6個月) 需更換  |
| 機油     | engine_oil       | 初始依到港日期 720天 (24個月) 需更換 |
| 尿素     | exhaust_fluid    | 初始依到港日期 720天 (24個月) 需更換 |
| 檢查中   | check            | 車輛維護時, 發現需送修之情況         |

## 動作
| 項目     | 說明                                                                    |
| -------- | ---------------------------------------------------------------------- |
| 詳細資料 | 可查閱該車輛之生產、底盤編號、QRcode、建立日期、到港日期、註記與各保養項目之保養紀錄  |
| 檢查     | 可查閱該車輛之生產、底盤編號、QRcode, 並編輯車輛檢查與填寫註記                   |