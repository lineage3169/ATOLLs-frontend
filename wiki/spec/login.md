# 登入

## 功能
* 帳號輸入
* 密碼輸入
    * 支援使用者按下Enter執行登入
* 使用者登入

![登入介面](./img/login.jpg)

### 登入
* 檢查是否填入帳號
* 檢查是否填入密碼
* 成功跳轉至首頁 `https://server_ip:port/frontend`
* 帳號未有任何權限將無法登入
* 授權碼錯誤將無法登入

### 登入儲存資訊 (vuex)
|          參數         |          描述                           |
|----------------------|---------------------------------------- |
| user                 | 帳號                                     |
| csrfToken            | 與後端API聯繫認證用                        |
| groups               | 權限，決定選單是否可見                      |
| email                | 使用者電子信箱，account.vue帶入資料用        |
| firstName            | 使用者名稱，account.vue帶入資料用           |
| lastName             | 使用者姓氏，account.vue帶入資料用           |
| profile              | 使用者帳號設定                            |
| userId               | 使用者ID                                 |
| features             | 使用者權限                                 |