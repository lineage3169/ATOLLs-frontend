const methods = {
    methods: {
        handleFocus(item = null) {
            const focusItem = { param: 'focusItem', data: item }
            this.$store.commit('updateData', focusItem)
        },
        getMatainDate(timesArr, initTime = '') {
            if (!initTime) return '-'
            if (!timesArr) return 0
            const today = new Date()
            let date = null
            const len = timesArr.length
            if (len === 0) date = new Date(initTime)
            else if (len > 0) {
                const [lastDate] = timesArr.slice(-1)
                date = new Date(lastDate)
            }
            let days = parseInt((today - date) / 1000 / 60 / 60 / 24)
            if (days < 0) days = 0
            return days
        },
        getAlert(days, rule) {
            if (typeof days !== 'number') return false
            if (!days || !rule) return false
            if (days > (rule - 5)) return true
            else return false
        },
        uploadFileError(response) {
            let errMsg = this.$t('Error.UploadFile.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 檔案格式錯誤，允許的格式為 (jpg, jpeg, png)
                case 1:
                    errMsg += this.$t('Error.UploadFile.Code1')
                    break
                // 查無此物件ID
                case 2:
                    errMsg += this.$t('Error.UploadFile.Code2')
                    break
                default:
                    errMsg += `${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        getVehicleListError(response) {
            let errMsg = this.$t('Error.PmGetVList.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供車輛條碼
                case 1:
                    errMsg += this.$t('Error.PmGetVList.Code1')
                    break
                default:
                    errMsg += `${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        pmSearchError(response) {
            let errMsg = this.$t('Error.GeneralSearch.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 缺少查詢條件
                case 1:
                    errMsg += this.$t('Error.GeneralSearch.Code1')
                    break
                // 無效的日期格式
                case 2:
                    errMsg += this.$t('Error.GeneralSearch.Code2')
                    break
                // 無效的資料格式
                case 3:
                    errMsg += this.$t('Error.GeneralSearch.Code3')
                    break
                default:
                    errMsg += `${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        }
    }
}
export default methods