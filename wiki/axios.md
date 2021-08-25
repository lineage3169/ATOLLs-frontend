#  Axios
* 統一在main.js 管理
* Vue.mixin 提供全域共用涵式 ajax

## 一般用法
```javascript
let config = {
    method: 'get', // get, post
    path: '',
    baseURL: '', // 可置換基底路徑
    obj: {},     // params
    fromData: new FromData(), // FromData
    header: {},  // 可置換headers
    type: '',    // responseType
    timeout: 150000, // 單位 ms, 可個別調整
    success: (respsone, parms) => {
        console.log(respsone)
        console.log(parms)
    },
    error: (error, parms) => {
        console.log(error)
        console.log(parms)
    },
    final: (respsone) => {
        console.log(respsone)
    }
    
}
this.ajax(config)
```


| 項目    | 型別     | 預設                                           | 說明                       |
| ------- | -------- | ---------------------------------------------- | -------------------------- |
| method  | String   | ''                                             | get 或 post(必填)          |
| path    | String   | ''                                             | 路徑(必填)                 |
| baseURL | String   | this.$store.state.backendUrl                   | 可置換基底路徑             |
| obj     | Object   | {}                                             | 參數                       |
| fromData| fromData |                                                | 參數 (fromData)            |
| header  | Object   | { 'X-CSRFToken': this.$store.state.csrfToken } | 可置換headers              |
| type    | String   | 'json'                                         | 伺服器回應數據型別         |
| timeout | Integer  | 15000                                          | 可個別設定預時             |
| success | Function |                                                | 伺服器回應成功可執行的涵式 |
| error   | Function |                                                | 伺服器回應失敗可執行的涵式 |
| final   | Function |                                                | 結束時執行的涵式           |



## 全域設定
> main.js
```javascript
axios.defaults.timeout = 15 * sec
axios.defaults.headers.post['Content-Type'] = 'application/x-www-form-urlencoded'
// 攔截器
axios.interceptors.response.use(
// 409錯誤
// 401錯誤
// timeout
// 網路錯誤
// 斷線
)
```