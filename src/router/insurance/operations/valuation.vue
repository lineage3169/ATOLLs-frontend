<template>
    <div class="p-valuation-management">
        <div class="select-area">
            <div class="select-area__tool">
                <div class="select-area__tool__title mr-15">
                    {{$t('Outsourcing') + $t('Company')}}
                </div>
                <div class="quick-search">
                    <i-input v-model="quickSearchStr"
                             clearable
                             :placeholder="`${$t('Quick')}${$t('Search')}...`"
                             @on-change="handleQuickSearch()"/>
                </div>
            </div>
            <div class="select-container noselect">
                <div v-for="(item, index) in outsourcingList"
                     class="select-area__item"
                     :class="{'select-area__item--active':item.active === true}"
                     :key="index"
                     @click.stop="handleOutsourcingClick(item)">
                    <div class="select-area__item__name">{{item.name}}</div>
                    <div class="select-area__item__alias">{{item.alias}}</div>
                </div>
                <div v-show="outsourcingList.length === 0" class="error-msg">
                    {{$t('NoData')}}
                </div>
            </div>
        </div>
        <div class="status-info">
            <template v-if="isNeedApprove">
                <div class="status-info__item status-info__item--new mr-15">{{$t('Add')}}</div>
                <div class="status-info__item status-info__item--edit mr-15">{{$t('EditA')}}</div>
                <div class="status-info__item status-info__item--delete">{{$t('Delete')}}</div>
            </template>
        </div>
        <div v-show="errorMsg" class="error-msg">
            {{errorMsg}}
        </div>
        <div class="table">
            <Spin v-show="apiLoading" size="large" fix/>
            <div v-if="originTable.length > 0" class="origin-table">
                <div class="table__header">
                    <div v-for="(title,index) in tableHeader"
                         class="table__col"
                         :key="index">
                         {{title}}
                    </div>
                </div>
                <div v-for="(item,index) in originTable"
                     class="table__row"
                     :class="{'table__row--even':index % 2 === 1}"
                     :key="'origin-row'+index">
                    <div v-for="(key,index) in tableColValue"
                         class="table__col"
                         :key="'tabel-col' + index">
                         {{item[key]}}
                    </div>
                </div>
            </div>
            <div v-if="isNeedApprove" class="contrast-table ml-20">
                <div class="table__header">
                    <div v-for="(title,index) in tableHeader"
                         class="table__col"
                         :key="index">
                         {{title}}
                    </div>
                </div>
                <div v-for="(item,index) in contrastTable"
                     class="table__row"
                     :class="{'table__row--delete':item.status === 'DELETED',
                              'table__row--edit':item.status === 'EDITED',
                              'table__row--new':item.status === 'NEW'}"
                     :key="'contrast-row'+index">
                    <div v-for="(key,index) in tableColValue"
                         class="table__col"
                         :key="'tabel-col' + index">
                         {{item[key]}}
                    </div>
                </div>
            </div>

        </div>
        <div v-if="isNeedApprove" class="btn-container">
            <Button class="btn w-150"
                    :loading="apiLoading"
                    @click.stop="handleSubmit('True')">
                    {{$t('Agree')}}
            </Button>
        </div>
    </div>
</template>
<script>
export default {
    name: 'ValuationManagement',
    data() {
        return {
            quickSearchStr: '',
            ticket: '',
            errorMsg: '',
            outsourcingID: '',
            outsourcingListPool: [],
            outsourcingList: [],
            originTable: [],
            contrastTable: [],
            allPAWData: [],
            tableHeader: [
                this.$t('IDA'), // 識別碼
                this.$t('Name'), // 名稱
                this.$t('Unit'), // 單位
                this.$t('PerUnitPrice'), // 每單位單價(新台幣)
                this.$t('PerUnitWeight') // 每單位重量(克)
            ],
            tableColValue: ['id', 'name', 'unit', 'price', 'weight'],
            isNeedApprove: false,
            apiLoading: false
        }
    },
    async created() {
        await this.getOutsourcingInfo()
        if (this.outsourcingListPool.length > 0)
            this.getOutsocuringPAW()
    },
    methods: {
        getAtollTicket() {
            const config = {
                method: 'post',
                path: '/1/sys/c/auth/ticket/get/',
                obj: { ATOLL_API_KEY: '1234' },
                success: response => { this.ticket = response.data.data },
                error: this.getAtollTicketError
            }
            return this.ajax(config)
        },
        async getOutsourcingInfo() {
            await this.getAtollTicket()
            const ticket = this.ticket
            if (!ticket) return
            this.quickSearchStr = ''
            const headersObj = {}
            headersObj.AUTHORIZATION = 'ATOLLs ' + ticket
            const config = {
                method: 'post',
                path: '/1/ins/t/outsourcing/ALL/get/',
                header: headersObj,
                params: this.$t('Error.Outsourcing.GetInfoGeneral') + '<br>',
                success: this.getOutsourcingSuccess,
                error: this.getOutsourcingError
            }
            return this.ajax(config)
        },
        getOutsourcingSuccess(response) {
            if (!response.data || !response.data.data)
                return
            if (response.data.data.length === 0)
                return
            const data = response.data.data
            this.outsourcingListPool = data.map(item => {
                item.active = false
                return item
            })
            this.handleQuickSearch()
        },
        handleError(response, msg = '') {
            var errMsg = msg
            if (response.status === 400) {
                const content = response.data || ''
                if (content) errMsg += `${content}<br>`
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        handleOutsourcingClick(item) {
            this.outsourcingListPool.forEach(el => { el.active = false })
            this.outsourcingList.forEach(el => { el.active = false })
            item.active = true
            this.outsourcingID = item.id
            this.setTableData(item.id)
        },
        async getOutsocuringPAW() {
            await this.getAtollTicket()
            const ticket = this.ticket
            if (!ticket) return
            this.apiLoading = true
            const headersObj = {}
            headersObj.AUTHORIZATION = 'ATOLLs ' + ticket
            const config = {
                method: 'post',
                path: '/1/ins/c/outsourcing/paw/ALL/get/',
                header: headersObj,
                params: this.$t('Error.Outsourcing.GetPAWGeneral') + '<br>',
                success: this.getOutsocuringPAWSuccess,
                error: this.handleError,
                final: this.apiLoading = false
            }
            return this.ajax(config)
        },
        getOutsocuringPAWSuccess(response) {
            if (!response.data || !response.data.data)
                return
            if (response.data.data.length === 0) {
                this.errorMsg = this.$t('NoData')
                return
            }
            this.allPAWData = response.data.data
        },
        setTableData(id) {
            this.resetData()
            const [data] = this.allPAWData.filter(item => item.outsourcing_id === id)
            if (!data) {
                this.errorMsg = this.$t('NoData')
                return
            }
            const originObj = data.paw || {}
            const contrastObj = data.pending_paw || {}
            const allKeys = [...Object.keys(originObj), ...Object.keys(contrastObj)]
            const allKeysSet = [...new Set(allKeys)]
            const approvalTime = new Date(data.approval_time)
            const updateTime = new Date(data.update_time)
            const originArr = []
            const contrastArr = []
            const initObj = {
                id: '',
                name: '',
                price: '',
                unit: '',
                weight: '',
                status: ''
            }
            if (approvalTime < updateTime)
                this.isNeedApprove = true
            Object.keys(originObj)
                .forEach(key => {
                    const obj = this.deepCopy(originObj[key])
                    obj.id = key
                    originArr.push(obj)
                })
            allKeysSet.forEach(key => {
                if (Object.keys(contrastObj).indexOf(key) === -1) {
                    const obj = this.deepCopy(initObj)
                    obj.id = `- ${this.$t('Delete')}`
                    obj.status = 'DELETED'
                    contrastArr.push(obj)
                }
                else {
                    let obj = this.deepCopy(contrastObj[key])
                    if (originObj[key]) {
                        const originValues = Object.values(originObj[key]).join(',')
                        const contrastValues = Object.values(contrastObj[key]).join(',')
                        if (contrastValues === originValues) obj = this.deepCopy(initObj)
                        else {
                            obj.id = key
                            obj.status = 'EDITED'
                        }
                    }
                    else {
                        obj.status = 'NEW'
                        obj.id = key
                    }
                    contrastArr.push(obj)
                }
            })
            if (Object.keys(originObj).length === 0) originArr.push(initObj)
            this.originTable = originArr
            this.contrastTable = contrastArr
        },
        resetData() {
            this.errorMsg = ''
            this.originTable = []
            this.contrastTable = []
            this.isNeedApprove = false
        },
        async handleSubmit() {
            this.apiLoading = true
            const config = {
                method: 'post',
                path: '/1/ins/c/outsourcing/paw/agreement/update/',
                obj: { outsourcing_id: this.outsourcingID },
                params: this.$t('Error.Outsourcing.AgreePAWGeneral') + '<br>',
                success: this.handleSubmitSuccess,
                error: this.handleSubmitError,
                final: this.apiLoading = false
            }
            this.ajax(config)
        },
        async handleSubmitSuccess() {
            this.resetData()
            await this.getOutsocuringPAW()
            this.setTableData(this.outsourcingID)
        },
        handleSubmitError(response) {
            var errMsg = this.$t('Error.AgreementUpdate.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 找不到該委外編號
                    errMsg += this.$t('Error.AgreementUpdate.Code1')
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
        handleQuickSearch() {
            const searchStr = this.quickSearchStr
            this.outsourcingList = []
            this.outsourcingList = this.outsourcingListPool.filter(
                item => {
                    const isNameMatch = item.name.indexOf(searchStr) > -1
                    const isAliasMatch = item.alias.indexOf(searchStr) > -1
                    return isNameMatch || isAliasMatch
                })
        }
    }
}
</script>