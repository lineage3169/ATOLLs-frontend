// 配置參考
// https://cli.vuejs.org/zh/config
module.exports = {
    // 不產出map檔案 (影響錯誤訊息的明確性)
    productionSourceMap: false,
    // 產出後檔名
    // indexPath:'index.html',
    // 靜態資料路徑 (產出後的JS CSS ... 會放置此資料夾)
    assetsDir: 'static',
    // '' 或 './' 產出(npm run build)後會成為相對路徑
    publicPath: '/',
    css: {
        loaderOptions: {
            less: {
                lessOptions: {
                    javascriptEnabled: true
                }
            }
        }
    },
    configureWebpack: {
        performance: {
            hints: false
        }
    },
    devServer: {
        https: true,
        port: 8008
    }
}