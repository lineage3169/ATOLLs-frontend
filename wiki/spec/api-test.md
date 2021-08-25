# 測試

## 路徑
`https://server_ip:port/frontend/backend`

## 功能說明

* 提供開發人員用於測試API
* 提供 POST / GET 兩種方法
* 提供選擇本系統之驗證機制
	* CSRF
	* Ticket
* 輸入框先載入所有API之路徑
	* 輸入框輸入文字可查詢符合的API路徑
	* 亦可接收自訂輸入
* 提供輸入參數
	* 重複的Key值將會當作 **陣列型態** 傳送
* 結果顯示於 Response 區塊