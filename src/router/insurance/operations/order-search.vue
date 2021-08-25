<template>
    <div class="orderSearchApp">
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
                            <Button :class="'btn btn--outline btn--long mr-15'"
                                    :disabled="disableSearch()"
                                    @click.stop="resetInputs()">
                                    {{$t('Reset')}}
                            </Button>
                            <Button type="primary"
                                    :class="'btn btn--long'"
                                    :loading="apiLoading"
                                    :disabled="disableSearch()"
                                    @click.stop="getData()">
                                    {{ $t('Search') }}
                            </Button>
                        </div>
                    </div>
                </Panel>
            </Collapse>
        </div>
        <div class="info-bar" v-show="dataPool.length > 0">
            <Pagination v-model="pageIndex"
                        ref="pagination"
                        :data-length="data.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                class="table"
                stripe
                max-height="600"
                ref="table"
                no-data-text="No data"
                :columns="columns"
                :data="data[pageIndex]" />
        <div v-show="dataPool.length > 0" class="info-bar">
            <Pagination v-model="pageIndex"
                        :data-length="data.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <div v-if="errorMsg" class="error-msg">
            {{errorMsg}}
        </div>
    </div>
</template>

<script>
import Pagination from '@/components/pagination.vue'
import FormItems from '@/components/form-items.vue'
import condition from './condition/order-search'
import columns from './columns/order-search'
export default {
    name: 'OrderSearch',
    components: { Pagination, FormItems },
    data() {
        return {
            searchForm: {
                date_range: [],
                order_id: '',
                outsourcing_name: ''
            },
            dataPool: [],
            data: [],
            apiLoading: false,
            errorMsg: null,
            searchCollapse: ['1'],
            pageIndex: 0,
            pageLimit: 10,
            totalRecords: 0,
            condition: condition(this),
            columns: columns(this)
        }
    },
    methods: {
        getData() {
            this.resetData()
            const obj = this.transToGet()
            const config = {
                method: 'get',
                path: '/1/ins/c/order/map/get/',
                obj: obj,
                success: this.getDataSuccess,
                error: this.getDataError,
                final: this.getDataFinal
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            this.collectSearchBar()
            if (!response || !response.data || !response.data.data) {
                this.errorMsg = this.$t('NoData')
                return
            }
            if (response.data.data.length === 0) {
                this.errorMsg = this.$t('NoData')
                return
            }
            this.dataPool = response.data.data
            this.dataPool.forEach(item => {
                item.order_id = item.order.id
                item.name = item.outsourcing.name
                item.alias = item.outsourcing.alias
                item.create_time = this.transTimeFormat(item.create_time)
            })
            this.totalRecords = response.data.data.length
            this.setPagination()
        },
        getDataError(response) {
            let errMsg = this.$t('Error.OrderCalendar.GetGeneral') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 錯誤的工單編號格式
                    errMsg += this.$t('Error.OrderSearch.Code1')
                    break
                case 2:
                    // 沒有提供搜尋條件
                    errMsg += this.$t('Error.OrderSearch.Code2')
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
        },
        getDataFinal(response) {
            this.apiLoading = false
        },
        setDates(data) {
            this.searchForm.date_range = data
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        resetInputs() {
            this.searchForm = {
                date_range: [],
                order_id: '',
                outsourcing_name: ''
            }
        },
        resetData() {
            this.data = []
            this.dataPool = []
            this.errorMsg = null
            this.totalRecords = 0
            this.apiLoading = true
        },
        collectSearchBar() {
            const collapse = setTimeout(() => {
                this.searchCollapse = []
                clearTimeout(collapse)
            }, 200)
        },
        transToGet() {
            const data = this.deepCopy(this.searchForm)
            if (JSON.stringify(data.date_range) === '["",""]')
                data.date_range = []
            data.date_range = this.transDateFormat(data.date_range)
            const obj = { condition: null }
            obj.condition = JSON.stringify(data)
            return obj
        },
        transDateFormat(data) {
            if (data.length > 0)
                return data.map(item => item.replace(/-/g, ''))
            else return []
        },
        transTimeFormat(timeString) {
            if (timeString) {
                const d = new Date(timeString)
                return d.toLocaleString('zh-TW', { hour12: false })
            }
            else return ''
        },
        disableSearch() {
            let verify = true
            const dateRange = this.searchForm.date_range
            if (dateRange.length === 2 && JSON.stringify(dateRange) !== '["",""]')
                verify = false
            else if (this.searchForm.order_id)
                verify = false
            else if (this.searchForm.outsourcing_name)
                verify = false
            return verify
        }
    },
    watch: {
        searchForm: {
            deep: true,
            handler() {
                this.disableSearch()
            }
        },
        'searchForm.outsourcing_name': function(data) {
            if (data && typeof (data) === 'string') this.searchForm.outsourcing_name = data.toUpperCase()
        }
    }
}
</script>