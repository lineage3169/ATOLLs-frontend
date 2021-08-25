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
                                    :disabled="disableSearch()"
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
        <EditModal v-model="editShow"
            :vehicle="selectedVehicle"
            @on-save="getData()"/>
        <GadgetsModal v-model="gadgetsShow"
            :vehicle="selectedVehicle"/>
        <AttachedImagesModal v-model="attachedShow"
            :vehicle="selectedVehicle"/>
    </div>
</template>
<script>
import Pagination from '@/components/pagination.vue'
import FormItems from '@/components/form-items.vue'
import LogModal from '@/components/modal/log.vue'
import EditModal from '@/components/modal/vehicle-edit.vue'
import GadgetsModal from '@/components/modal/gadgets.vue'
import AttachedImagesModal from '@/components/modal/attached-images.vue'
import condition from './condition/search'
import columns from './columns/search'
export default {
    name: 'VehicleSearch',
    components: {
        Pagination,
        FormItems,
        LogModal,
        EditModal,
        GadgetsModal,
        AttachedImagesModal
    },
    props: {
        type: {
            type: String,
            default: ''
        }
    },
    data() {
        return {
            objectId: '',
            searchForm: {
                create_dates: '',
                search_id: '',
                quota: '',
                reconfirm: '',
                arrival_date: '',
                leave_garage_date: ''
            },
            customI18n: {
                quota_init: `${this.$t('Initial')}${this.$t('Quota')}${this.$t('Unit')}`,
                remark: this.$t('Remarks'),
                arrival_date: this.$t('ArrivalDate'),
                leave_garage_date: this.$t('LeaveGarageDate')
            },
            searchCollapse: ['1'],
            quota: this.$store.state.quota,
            errorMsg: '',
            condition: condition(this),
            columns: columns(this),
            selectedVehicle: {},
            data: [],
            dataPool: [],
            originData: [],
            reconfirmList: [
                {
                    label: this.$t('Yes'),
                    value: 'Y'
                },
                {
                    label: this.$t('No'),
                    value: 'N'
                }
            ],
            totalRecords: 0,
            pageIndex: 0,
            pageLimit: 10,
            logShow: false,
            editShow: false,
            gadgetsShow: false,
            attachedShow: false,
            apiLoading: false
        }
    },
    created() {
        this.setCreateDates()
        this.setReconfirm()
        this.getQuotaList()
    },
    methods: {
        getData() {
            this.apiLoading = true
            this.resetData()
            const obj = this.getPostData()
            const config = {
                method: 'get',
                path: '/1/pm/c/search/general/get/',
                obj: obj,
                success: this.getDataSuccess,
                error: this.pmSearchError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response.data.data) return
            const data = response.data.data
                .filter(item => {
                    if (this.type === 'Edit')
                        return item.progress !== 'LG'
                    return item
                })
            this.originData = this.deepCopy(data)
            this.dataPool = this.setData(data)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
            else this.errorMsg = this.$t('NoData')
            this.collectSearchBar()
        },
        getPostData() {
            const data = this.deepCopy(this.searchForm)
            const create_dates = data.create_dates ? data.create_dates.join(',') : ''
            const arrival_date = data.arrival_date ? data.arrival_date.join(',') : ''
            const leave_garage_date = data.leave_garage_date ? data.leave_garage_date.join(',') : ''
            let reconfirm = ''
            if (data.reconfirm === 'Y') reconfirm = true
            if (data.reconfirm === 'N') reconfirm = false
            const obj = {
                search_id: data.search_id,
                type_code: 'V',
                progress: '',
                status: '',
                create_dates: create_dates,
                given_date_type: '',
                custom: {
                    quota: data.quota,
                    arrival_date: arrival_date,
                    leave_garage_date: leave_garage_date,
                    reconfirm: {
                        status: reconfirm
                    }
                }
            }
            return obj
        },
        setData(data) {
            return data.map(item => {
                item.create_time = this.dateToFormat(item.create_time)
                if (item?.custom?.quota)
                    item.quota = this.quota[item.custom.quota]
                if (item?.pg_info?.name)
                    item.pg_name = item.pg_info.name
                if (item?.custom?.reconfirm?.status)
                    item.reconfirm = item.custom.reconfirm.status
                else item.reconfirm = false
                if (item?.ps_info?.barcode)
                    item.ps_info_barcode = item.ps_info.barcode
                item.custom = this.setCustom(item?.custom)
                return item
            })
        },
        setCustom(custom) {
            if (!custom) return {}
            const obj = {}
            if (custom?.quota_init)
                obj[this.getCustomI18n('quota_init')] = this.quota[custom.quota_init]
            if (custom?.reconfirm?.remark)
                obj[this.getCustomI18n('remark')] = custom.reconfirm.remark
            if (custom?.arrival_date)
                obj[this.getCustomI18n('arrival_date')] = this.dateToFormat(custom.arrival_date, false)
            if (custom?.leave_garage_date)
                obj[this.getCustomI18n('leave_garage_date')] = this.dateToFormat(custom.leave_garage_date)
            return obj
        },
        getCustomI18n(string) {
            const keys = Object.keys(this.customI18n)
            const hasKey = keys.indexOf(string) > -1
            if (hasKey) return this.customI18n[string]
            return string
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.data = []
            this.data = this.$refs.pagination.handleData(this.dataPool)
        },
        setDates(data, model) {
            const isNull = [...new Set(data)][0] === ''
            if (isNull) this.searchForm[model] = ''
            else this.searchForm[model] = this.deepCopy(data)
        },
        resetData() {
            this.errorMsg = ''
            this.dataPool = []
            this.data = []
            this.totalRecords = 0
            this.pageIndex = 0
            this.pageLimit = 10
        },
        resetInput() {
            this.searchForm = {
                create_dates: '',
                search_id: '',
                quota: '',
                reconfirm: '',
                arrival_date: '',
                leave_garage_date: ''
            }
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
        },
        handleSelect(id, modal) {
            [this.selectedVehicle] = this.originData
                .filter(item => item.id === id)
            const _this = this
            const hasKey = Object.prototype
                .hasOwnProperty
                .call(_this, modal)
            if (modal && hasKey) this[modal] = true
        },
        disableSearch() {
            const hasValue = Object.values(this.searchForm)
                .some(value => value)
            if (!hasValue) return true
            return false
        },
        getQuotaList() {
            this.condition = this.condition.map(item => {
                if (item.model === 'quota')
                    item.optionMap = this.quota
                return item
            })
        },
        setReconfirm() {
            this.condition = this.condition.map(item => {
                if (item.model === 'reconfirm')
                    item.list = this.reconfirmList
                return item
            })
        },
        setExportData() {
            const quota_init = this.getCustomI18n('quota_init')
            const remark = this.getCustomI18n('remark')
            const arrival_date = this.getCustomI18n('arrival_date')
            const leave_garage_date = this.getCustomI18n('leave_garage_date')
            const data = this.excelExport(this.dataPool
                .map(item => {
                    if (item.reconfirm) item.reconfirm = 'Y'
                    else item.reconfirm = ''
                    item.quota_init = item.custom[quota_init] || ''
                    item.remark = item.custom[remark] || ''
                    item.arrival_date = item.custom[arrival_date] || ''
                    item.leave_garage_date = item.custom[leave_garage_date] || ''
                    return item
                }))
            const columns = this.columns
                .filter(item => item.key !== 'action' && !item.type)
            const custom = [
                {
                    title: quota_init,
                    key: 'quota_init'
                },
                {
                    title: remark,
                    key: 'remark'
                },
                {
                    title: arrival_date,
                    key: 'arrival_date'
                },
                {
                    title: leave_garage_date,
                    key: 'leave_garage_date'
                }
            ]
            this.$refs.table.exportCsv({
                filename: '查詢結果.csv',
                columns: [...columns, ...custom],
                data: data
            })
        },
        setCreateDates() {
            if (this.type !== 'Edit') return
            const today = new Date()
            const date = this.dateToFormat(today, false)
            this.searchForm.create_dates = [date, date]
            this.getData()
        },
        removeRows(id) {
            this.dataPool = this.dataPool
                .filter(item => item.id !== id)
            this.totalRecords = this.dataPool.length
            if (this.totalRecords > 0) this.setPagination()
            else this.errorMsg = this.$t('NoData')
        }
    },
    watch: {
        type(data) {
            this.resetData()
            this.searchForm = {
                create_dates: '',
                search_id: '',
                quota: '',
                reconfirm: '',
                arrival_date: '',
                leave_garage_date: ''
            }
            this.searchCollapse = ['1']
            this.columns = this.columns
                .map(item => {
                    if (item.key === 'action') {
                        if (data === 'Edit' && item.width !== 120)
                            item.width = 120
                        else item.width = 300
                    }
                    return item
                })
            this.setCreateDates()
        }
    }
}
</script>