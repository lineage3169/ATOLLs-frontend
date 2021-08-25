# 系統設定 - 使用者

## 功能
* 管理使用者
* 設定使用者權限
* 顯示/編輯使用者資訊
    * 使用者名稱 (帳號)
    * 電子郵件
    * 姓
    * 名
* 依使用者名稱快速查詢

## 規範
| 帳號     | 可編輯帳號                     | 可編輯權限                                       |
| -------- | ------------------------------ | ------------------------------------------------ |
| atoll    | atoll <br> Admin <br> 一般帳號 | 帳號名稱不可修改 <br> 權限預設全部開啟且鎖定     |
| Admin    | Admin <br> 一般帳號            | 帳號名稱不可修改 <br> 使用者權限預設為開啟且鎖定 |
| 一般帳號 | 一般帳號                       | 可更改帳號名稱 <br> 權限預設全部關閉             |

## 新增使用者規範
| 項目       | 規範                                                                                                 |
| ---------- | ---------------------------------------------------------------------------------------------------- |
| 使用者名稱 | 不可為空值 <br> 不得輸入特殊符號(@除外) <br> 不得輸入中文字 <br> 不得輸入空白符號 <br> 需小於 150 字 |
| 密碼       | 不可為空值 <br> 需包含英文字 <br> 8 - 16碼                                                           |
| 確認密碼   | 不可為空值 <br> 需與密碼完全相同                                                                     |