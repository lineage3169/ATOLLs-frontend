<template>
    <div class="m-search">
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
                                    @click.stop="resetInput()">
                                    {{$t('Reset')}}
                            </Button>
                            <Button type="primary"
                                    :class="'btn btn--long'"
                                    :loading="apiLoading"
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
            <Button class="btn btn--export fz--large"
                    @click="setExportData()">
                    <Icon type="md-download" />
                    {{ $t('Export') }}
            </Button>
        </div>
        <Table  v-show="data[pageIndex] && data[pageIndex].length > 0"
                stripe
                class="table"
                max-height="600"
                ref="table"
                no-data-text="No data"
                :columns="columns"
                :data="data[pageIndex]">
        </Table>
        <div class="info-bar" v-show="dataPool.length > 0">
            <Pagination v-model="pageIndex"
                        :data-length="data.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <div v-show="errorMsg && searchCollapse.length == 0"
            class="error-msg">
            {{ errorMsg }}
        </div>
        <LogModal v-model="logShow" :id="objectId"/>
    </div>
</template>
<script>
import Pagination from '@/components/pagination.vue'
import FormItems from '@/components/form-items.vue'
import LogModal from '@/components/modal/log.vue'
import condition from './condition/search'
import columns from './columns/search'
export default {
    name: 'ParkingSpaceSearch',
    components: {
        Pagination, FormItems, LogModal
    },
    data() {
        return {
            searchForm: {
                search_id: '',
                pg_id: ''
            },
            searchCollapse: ['1'],
            errorMsg: '',
            condition: condition(this),
            columns: columns(this),
            data: [],
            dataPool: [],
            objectId: '',
            totalRecords: 0,
            pageIndex: 0,
            pageLimit: 10,
            logShow: false,
            apiLoading: false
        }
    },
    created() {
        this.getAreaList()
    },
    methods: {
        setExportData() {
            const data = this.dataPool
                .map(item => {
                    item.used = item.used ? 'Y' : ''
                    return item
                })
            const columns = this.columns
                .filter(item => item.key !== 'action' && !item.type)
            this.$refs.table.exportCsv({
                filename: '查詢結果.csv',
                columns: columns,
                data: data
            })
        },
        getAreaList() {
            const config = {
                method: 'get',
                path: '/1/pm/c/pg/get/',
                success: this.getAreaListSuccess,
                error: this.getAreaListError
            }
            this.ajax(config)
        },
        getAreaListSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            const list = data
                .map(item => {
                    return {
                        value: item.id,
                        label: item.name
                    }
                })
                .sort((a, b) => {
                    const labelA = a.label.toUpperCase()
                    const labelB = b.label.toUpperCase()
                    if (labelA < labelB)
                        return -1
                    if (labelA > labelB)
                        return 1
                    return 0
                })
            this.condition = this.condition
                .map(item => {
                    if (item.model === 'pg_id')
                        item.list = list
                    return item
                })
        },
        getAreaListError() {
            this.condition = this.condition
                .map(item => {
                    if (item.model === 'pg_id')
                        item.disabled = true
                    return item
                })
        },
        getData() {
            this.apiLoading = true
            this.resetData()
            const config = {
                method: 'get',
                path: '/1/pm/c/search/general/get/',
                obj: {
                    type_code: 'PS',
                    search_id: this.searchForm.search_id
                },
                success: this.getDataSuccess,
                error: this.pmSearchError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            this.dataPool = this.setData(data)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
            else this.errorMsg = this.$t('NoData')
            this.collectSearchBar()
        },
        setData(data) {
            const result = data
                .map(item => {
                    item.pg_name = item?.pg_info?.name ? item.pg_info.name : ''
                    if (item?.v_info) {
                        const v = item.v_info
                        item.used = true
                        item.v_origin_id = v?.origin_id ? v.origin_id : ''
                        item.v_name = v?.name ? v.name : ''
                        item.v_barcode = v?.barcode ? v.barcode : ''
                    }
                    else item.used = false
                    return item
                })

            if (this.searchForm.pg_id) {
                return result.filter(item => {
                    if (item?.pg_info?.id)
                        return item.pg_info.id === this.searchForm.pg_id
                })
            }
            else return result
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        resetInput() {
            this.searchForm = {
                search_id: '',
                pg_id: ''
            }
        },
        resetData() {
            this.errorMsg = ''
            this.dataPool = []
            this.data = []
            this.totalRecords = 0
            this.pageIndex = 0
            this.pageLimit = 10
        },
        collectSearchBar() {
            const collapse = setTimeout(() => {
                this.searchCollapse = []
                clearTimeout(collapse)
            }, 200)
        },
        handleLog(id) {
            if (!id) return
            this.objectId = id
            this.logShow = true
        }
    }
}
</script>