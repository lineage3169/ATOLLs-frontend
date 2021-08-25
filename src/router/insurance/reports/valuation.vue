<template>
    <div class="p-reports-valuation">
        <div class="content__collapse noselect">
            <Collapse v-model="searchCollapse" simple>
                <Panel name="1">
                    <span class="collapse__title noselect">
                        {{ $t('FilterB')}}
                    </span>
                    <div class="form-generate" slot="content">
                        <!-- 動態產出 from 元件 -->
                        <FormItems v-model="searchForm"
                                      :elements="condition"/>
                        <div class="form-generate__btns">
                            <Button class="btn btn--outline btn--long mr-15"
                                :disabled="disableSearch()"
                                @click.stop="resetInputData()">
                                {{ $t('Reset') }}
                            </Button>
                            <Tooltip max-width="350"
                                     :content="$t('Tooltips.Search')"
                                     :disabled="!disableSearch()">
                                <Button type="primary"
                                        :class="'btn btn--long'"
                                        :loading="apiLoading"
                                        :disabled="disableSearch()"
                                        @click.stop="getData()">
                                        {{ $t('Search') }}
                                </Button>
                            </Tooltip>
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
        <div class="info-bar">
            <div class="info-bar__total-records"></div>
            <Button class="btn btn--export fz--large"
                    v-if="data.length > 0"
                    @click="exportData()">
                    <Icon type="md-download" />
                    {{ $t('Export') }}
            </Button>
        </div>
        <template v-if="data.length > 0">
            <!-- 保單物料 -->
            <template v-if="policyData && policyData.length > 0">
                <div class="fz--huge mb-10 mt-0">
                    {{ $t('PolicyFactories') }}
                </div>
                <Table  stripe
                        class="table"
                        no-data-text="No data"
                        :columns="columns"
                        :data="policyData">
                </Table>
            </template>
            <!-- 包裝物料 -->
            <template v-if="packageData && packageData.length > 0">
                <div class="fz--huge mt-20 mb-10">
                    {{ $t('PackageFactories') }}
                </div>
                <Table  stripe
                        class="table"
                        no-data-text="No data"
                        :columns="columns"
                        :data="packageData">
                </Table>
            </template>
            <!-- 其他 -->
            <template v-if="otherData && otherData.length > 0">
                <div class="fz--huge mt-20 mb-10" >
                    {{ $t('Others') }}
                </div>
                <Table  stripe
                        class="table"
                        ref="valueTable"
                        no-data-text="No data"
                        :columns="columns"
                        :data="otherData">
                </Table>
            </template>
            <div class="compute">
                <div class="compute__items">
                    <div class="compute__items__title">
                        {{ `${$t('TotalA')}${$t('AmountA')} (${$t('TaxA')})` }}
                    </div>
                    <div class="compute__items__content">
                        {{ totalValue }}
                    </div>
                </div>
            </div>
        </template>
        <div class="error-msg"
             v-show="errorMsg && searchCollapse.length == 0">
            {{errorMsg}}
        </div>
    </div>
</template>

<script>
import FormItems from '@/components/form-items.vue'
import condition from './condition/valuation'
export default {
    name: 'ReportValuation',
    components: { FormItems },
    data() {
        return {
            searchForm: {
                mail_date: [],
                cycle_date: [],
                billingCategory: 'N,R',
                outsourcingID: ''
            },
            apiLoading: false,
            errorMsg: null,
            searchCollapse: ['1'],
            condition: condition(this),
            columns: [
                {
                    title: this.$t('Item'),
                    key: 'name'
                },
                {
                    title: this.$t('Unit'),
                    key: 'unit'
                },
                {
                    title: this.$t('Univalent'),
                    key: 'price'
                },
                {
                    title: this.$t('UsageA'),
                    key: 'amount'
                },
                {
                    title: this.$t('AmountA') + '(' + this.$t('TaxA') + ')',
                    key: 'value'
                }
            ],
            data: [],
            policyData: [],
            packageData: [],
            otherData: [],
            option: {
                disabledDate(date) {
                    return date && date.valueOf() > Date.now()
                }
            },
            totalValue: 0,
            billCateNameMap: {
                NB: '新契約',
                POS: '保服',
                CLM: '理賠'
            },
            exportType: '',
            exportStr: '',
            outsourcingList: null
        }
    },
    created() {
        this.getOutsourcingInfo()
        this.setBillCateNameMap()
    },
    methods: {
        getData() {
            this.apiLoading = true
            this.resetData()
            const postObj = {
                outsourcing_id: this.searchForm.outsourcingID,
                mail_date_range: this.dateFormatTrans(this.searchForm.mail_date)
                    .join(','),
                cycle_date_range: this.dateFormatTrans(this.searchForm.cycle_date)
                    .join(','),
                billing_category: this.searchForm.billingCategory
            }

            const config = {
                method: 'post',
                path: '/1/ins/c/others/price/calculate/',
                obj: postObj,
                timeout: this.sec(40),
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            this.data = this.setData(response.data.data)
            if (this.data.length === 0) this.errorMsg = this.$t('NoData')
            this.collectSearchBar()
        },
        getDataError(response) {
            var errMsg = this.$t('Error.ValueInfoTotal.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供委外編號
                    errMsg += this.$t('Error.ValueInfoTotal.Code1')
                    break
                case 2:
                    // 該委外編號沒有工單
                    errMsg += this.$t('Error.ValueInfoTotal.Code2')
                    break
                case 3:
                    // 無效發單類別
                    errMsg += this.$t('Error.ValueInfoTotal.Code3')
                    break
                case 4:
                    // 不合法的日期區間
                    errMsg += this.$t('Error.ValueInfoTotal.Code4')
                    break
                case 5:
                    // 權限不足
                    errMsg += this.$t('Error.ValueInfoTotal.Code5')
                    break
                case 6:
                    // 無效日期格式
                    errMsg += this.$t('Error.ValueInfoTotal.Code6')
                    break
                default:
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
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
            const headersObj = {}
            headersObj.AUTHORIZATION = 'ATOLLs ' + ticket
            const config = {
                method: 'post',
                path: '/1/ins/t/outsourcing/ALL/get/',
                header: headersObj,
                success: this.getOutsourcingSuccess,
                error: this.getOutsourcingError
            }
            this.ajax(config)
        },
        getOutsourcingSuccess(response) {
            if (!response || !response.data)
                return this.setOutsourcingDisabled()
            if (!response.data.data || response.data.data.length === 0)
                return this.setOutsourcingDisabled()
            const data = response.data.data
            this.outsourcingList = data
                .reduce((acc, crr) => {
                    acc[crr.id] = `${crr.name} - ${crr.alias}`
                    return acc
                }, {})
            const index = this.condition
                .findIndex(item => item.model === 'outsourcingID')
            if (index > -1)
                this.condition[index].optionMap = this.outsourcingList
        },
        setOutsourcingDisabled() {
            this.condition = this.condition
                .map((item) => {
                    if (item.model === 'outsourcingID')
                        item.disabled = true
                    return item
                })
        },
        setData(data) {
            data.forEach(datum => {
                this.totalValue = Math.round(this.totalValue + datum.value)
            })

            this.policyData = data.filter(items => items.type === 'factory')
            this.packageData = data.filter(items => items.type === 'package')
            this.otherData = data.filter(items => {
                return items.type !== 'factory' && items.type !== 'package'
            })

            this.setTotal(this.policyData)
            this.setTotal(this.packageData)
            this.setTotal(this.otherData)

            return data
        },
        setCycleDate(date) {
            if (this.isEmptyArray(date)) this.searchForm.cycle_date = []
            else this.searchForm.cycle_date = date
        },
        setMailDate(date) {
            if (this.isEmptyArray(date)) this.searchForm.mail_date = []
            else this.searchForm.mail_date = date
        },
        setTotal(data) {
            const total = data.reduce((acc, cur) => parseInt(acc) + parseInt(cur.value), 0) || 0
            if (total) data.push({ item: 'Sub-Total', name: this.$t('SubTotal'), value: total })
        },
        resetData() {
            this.data = []
            this.errorMsg = null
            this.exportStr = ''
            this.policyData = []
            this.packageData = []
            this.otherData = []
            this.totalValue = 0
        },
        resetInputData() {
            this.searchForm = {
                mail_date: [],
                cycle_date: [],
                billingCategory: 'N,R',
                outsourcingID: ''
            }
        },
        exportData() {
            const d = new Date()
            const strDate = d.toISOString().slice(0, 10) + ' ' + d.toTimeString().slice(0, 8).replace(/:/g, '')
            let data = []
            let policyData = []
            let packageData = []
            let otherData = []

            this.exportType = this.billCateNameMap[this.searchForm.billingCategory]
            this.setExportStr()

            data.unshift(
                {
                    name: `報價單-正常件 (${this.exportType})`,
                    value: this.exportStr
                },
                { name: ' ' },
                {
                    name: this.$t('Item'),
                    unit: this.$t('Unit'),
                    price: this.$t('Univalent'),
                    amount: this.$t('UsageA'),
                    value: this.$t('AmountA') + '(' + this.$t('TaxA') + ')'
                })
            if (this.policyData && this.policyData.length > 0) {
                policyData.push({ name: '保單物料：' })
                policyData = [...policyData, ...this.deepCopy(this.policyData)]
                policyData = policyData.filter(item => item.name !== this.$t('SubTotal'))
                data = [...data, ...policyData]
            }
            if (this.packageData && this.packageData.length > 0) {
                packageData.push({ name: '包裝物料：' })
                packageData = [...packageData, ...this.deepCopy(this.packageData)]
                packageData = packageData.filter(item => item.name !== this.$t('SubTotal'))
                data = [...data, ...packageData]
            }
            if (this.otherData && this.otherData.length > 0) {
                otherData.push({ name: '其他：' })
                otherData = [...otherData, ...this.deepCopy(this.otherData)]
                otherData = otherData.filter(item => item.name !== this.$t('SubTotal'))
                data = [...data, ...otherData]
            }
            data.push({
                item: 'Total',
                name: `${this.$t('TotalA')}${this.$t('AmountA')}`,
                value: this.totalValue
            })

            // mixin from main.js
            data = this.excelExport(data)

            this.$refs.valueTable.exportCsv({
                filename: 'ValuationReport_' + strDate + '.csv',
                original: false,
                columns: this.columns,
                data: data,
                noHeader: true
            })
        },
        disableSearch() {
            const hasID = this.searchForm.outsourcingID
            const hasMailDate = this.searchForm.mail_date.length === 2
            const hasCycleDate = this.searchForm.cycle_date.length === 2
            if ((hasMailDate && hasID) || (hasCycleDate && hasID))
                return false
            return true
        },
        collectSearchBar() {
            const collapse = setTimeout(() => {
                this.searchCollapse = []
                clearTimeout(collapse)
            }, 200)
        },
        setExportStr() {
            if (this.searchForm.mail_date.length === 2)
                this.formatExportDate(this.searchForm.mail_date, '郵寄日期')
            if (this.searchForm.cycle_date.length === 2)
                this.formatExportDate(this.searchForm.cycle_date, '批次日期')
        },
        formatExportDate(input, title) {
            if (input[0] !== '' && input[1] !== '') {
                if (this.exportStr.length > 0) this.exportStr += ' ,'
                this.exportStr += title + '：'
                if (input[0] === input[1]) this.exportStr += input[0]
                else this.exportStr += input[0] + ' - ' + input[1]
            }
        },
        setBillCateNameMap() {
            const index = this.condition
                .findIndex(item => item.model === 'billingCategory')
            if (index > -1)
                this.condition[index].optionMap = this.billCateNameMap
        }
    }
}
</script>