const methods = {
    methods: {
        excelExport(data) {
            // 避免 Excel 轉出亂碼
            data.forEach(element => {
                Object.keys(element).forEach(el => {
                    if (typeof (element[el]) === 'string')
                        element[el] = '"' + element[el].replace(/"/g, '""') + '"'
                })
            })
            return data
        },
        dateFormatTrans(data) {
            if (!data) return data
            else {
                if (typeof (data) === 'string') return data.replace(/-/g, '')
                else if (data.length > 0)
                    return data.map(item => item.replace(/-/g, ''))
                else return data
            }
        },
        converValueByMaps(key, mapType) {
            switch (mapType.toString()) {
            case 'billing_category':
                return this.$store.state.billCateNameMap[key]
            case 'channel':
                return this.$store.state.channelNameMap[key]
            case 'status':
                return this.$store.state.statusNameMap[key]
            case 'cycle_type':
                return this.$store.state.cycleTypeNameMap[key]
            case 'posting_service':
                return this.$store.state.postNameMap[key]
            case 'effective_date':
                return this.convertDateToDisplay(key.toString())
            case 'mail_type':
                return this.$store.state.mailTypeNameMap[key]
            case 'progress':
                return this.$store.state.progressNameMap[key]
            default:
                return key
            }
        },
        setPdfBtnInit(item) {
            item.pdfDiasble = false
            // 還未轉檔將下載鈕鎖定
            if (item.progress === 'RC')
                item.pdfDiasble = true
            // 至今超過7天 屏蔽PDF
            if (item.meta.Flag && item.meta.Flag.PDF_REMOVED === true)
                item.pdfDiasble = true
            return item
        },
        filterCustomEmpty(item) {
            for (const key in item.custom) {
                const value = item.custom[key]
                if (typeof (value) !== 'boolean' && !value)
                    delete item.custom[key]
            }
            return item
        },
        setCutsomToParent(item) {
            for (const key in item.custom)
                item[key] = item.custom[key]
            return item
        },
        filterRegisterNum(item) {
            if (item.register_number && item.progress !== 'PO')
                delete item.register_number
            return item
        },
        converObjValue(item) {
            for (const key in item)
                item[key] = this.converValueByMaps(item[key], key)
            return item
        },
        deleteCustom(item) {
            delete item.custom
            return item
        },
        setCustom(data, col, igonre) {
            const keyNameMap = this.$store.state.keyNameMap
            const column = this.deepCopy(col)
                .map(item => item.key)
                .filter(item => item)
            return data.map(item => {
                const custom = {}
                Object.keys(item).forEach(key => {
                    const isNotInCloumn = column.indexOf(key) === -1
                    const isNotInIgonre = igonre.indexOf(key) === -1
                    if (isNotInCloumn && isNotInIgonre) {
                        const hasKeyNameProperty = Object.prototype
                            .hasOwnProperty
                            .call(keyNameMap, key)
                        if (hasKeyNameProperty) custom[keyNameMap[key]] = item[key]
                        else custom[key] = item[key]
                    }
                })
                item.custom = custom
                return item
            })
        },
        convertDateToDisplay(data) {
            if (!data) return ''
            const dateString = data.toString()
            const year = dateString.slice(0, 4)
            const month = dateString.slice(4, 6)
            const date = dateString.slice(6)
            return `${year}-${month}-${date}`
        },
        handleDownloadError(response) {
            let errMsg = this.$t('Error.PolicyDownload.General') + '<br>'
            const reader = new FileReader()
            reader.onload = e => {
                let code = null
                if (this.isJson(e.target.result)) code = parseInt(JSON.parse(e.target.result).code) || ''
                if (response.status === 400 && code) {
                    switch (code) {
                    case 1:
                        // 找不到檔案
                        errMsg += this.$t('Error.PolicyDownload.Code1')
                        break
                    default:
                        // 未預期的錯誤
                        errMsg += this.$t('Error.Unexpected')
                        break
                    }
                }
                else if (response.status)
                    errMsg += this.unexpectedErrMsg(response)
                console.error(response)
                this.errorModal(errMsg)
            }
            reader.readAsText(response.data)
        },
        convertStrToArr(dateString) {
            let dateArr = []
            if (dateString) dateArr = dateString.split(',')
            return dateArr
        },
        getCycleDate(cycleDate) {
            // 批次日期為過濾條件
            // 主要資料由建立日期為主
            // 格式為 ['20210101', '20210102', '20210103']
            if (!cycleDate) return ''
            if (cycleDate.length !== 2) return ''
            const sDate = new Date(cycleDate[0])
            const eDate = new Date(cycleDate[1])
            const oneDayTime = 86400000
            const days = parseInt((eDate - sDate) / oneDayTime)
            const arr = []
            arr.push(this.dateToFormat(sDate, false))
            for (let i = 0; i < days; i++) {
                sDate.setDate(sDate.getDate() + 1)
                arr.push(this.dateToFormat(sDate, false))
            }
            return this.dateFormatTrans(arr)
        },
        getCreateDate(cycleDate) {
            // 建立日期為主要後端搜索條件
            // 因保單可能於批次日期後一天才建立
            // 若搜索條件為 ['20210101', '20210105']
            // 需多搜尋一天 ['20210101', '20210106']
            // 再由批次日期去過濾資料達到目的
            if (!cycleDate) return ''
            if (cycleDate.length !== 2) return ''
            const lastDay = cycleDate[1] || ''
            const createDate = []
            if (lastDay) {
                const newLastDay = new Date(lastDay)
                newLastDay.setHours(0, 0, 0, 0)
                newLastDay.setDate(newLastDay.getDate() + 1)
                createDate.push(this.searchForm.cycle_date[0])
                createDate.push(this.dateToFormat(newLastDay, false))
            }
            return this.dateFormatTrans(createDate)
        },
        getMulitCreateDate(cycleDate) {
            // 批次日期多選時
            // 新增每個日期後一天
            // 不重複的總結做為建立日期
            const nextDateArr = cycleDate.map(dateString => {
                const nextDate = new Date(dateString)
                nextDate.setHours(0, 0, 0, 0)
                nextDate.setDate(nextDate.getDate() + 1)
                return this.dateToFormat(nextDate, false)
            })
            const setArr = [...new Set([...nextDateArr, ...cycleDate])]
            setArr.sort()
            return this.dateFormatTrans(setArr)
        },
        isDate(string) {
            if (Date.parse(string) > 0 && !isNaN(Date.parse(string)))
                return true
            return false
        },
        getAtollTicketError(response) {
            let errMsg = this.$t('Error.Ticket.GetGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有給ATOLL_API_KEY
                    errMsg += 'No "ATOLL_API_KEY" given'
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        getOutsourcingError(response) {
            var errMsg = this.$t('Error.Outsourcing.GetInfoGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        }
    }
}
export default methods