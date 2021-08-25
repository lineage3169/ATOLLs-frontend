<template>
    <div class="p-user-log">
        <Spin v-show="apiLoading" size="large" fix />
        <div class="tool mt-20 mb-15">
            <div class="search">
                <div class="search__label">
                    {{ $t('User') }}
                </div>
                <i-input v-model="search"
                        class="w-200"
                        type="text"
                        clearable
                        :placeholder="`${$t('Quick')}${$t('Search')}...`"
                        @input="handleSearch"/>
            </div>
            <div class="user-list">
                <div v-for="(item, index) in users"
                    class="user-list__item"
                    :class="{ 'user-list__item--active' : item.active }"
                    :key="index"
                    @click="getLog(item); setUerActive(item)">
                    {{ item.username }}
                </div>
            </div>
        </div>
        <div class="info-bar">
            <Pagination v-model="pageIndex"
                        ref="pagination"
                        :data-length="logs.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div v-show="dataPool.length > 0"
                class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <Table  v-if="logs[pageIndex] && logs[pageIndex].length > 0"
                class="table"
                stripe
                max-height="700"
                :row-class-name="rowClassName"
                :columns="columns"
                :data="logs[pageIndex]">
        </Table>
        <div class="info-bar">
            <Pagination v-model="pageIndex"
                        ref="pagination"
                        :data-length="logs.length"
                        :data-pool-length="dataPool.length"
                        :limit="pageLimit"
                        @reflash-limit="setPagination"/>
            <div v-show="dataPool.length > 0"
                class="info-bar__total-records">
                {{`${totalRecords} ${$t('Records')}${$t('Data')}`}}
            </div>
        </div>
        <div v-show="errorMsg"
            class="error-msg">
            {{ errorMsg }}
        </div>
    </div>
</template>
<script>
import Pagination from '@/components/pagination.vue'
import columns from './columns/user.js'
export default {
    name: 'LogUser',
    components: { Pagination },
    data() {
        return {
            search: '',
            levelMap: {
                0: 'NOTSET',
                10: 'DEBUG',
                20: this.$t('INFO'),
                30: this.$t('WARNING'),
                40: this.$t('ERROR'),
                50: this.$t('FATAL')
            },
            showColorMap: {
                30: 'table-warning-row',
                40: 'table-error-row',
                50: 'table-fatal-row'
            },
            logs: [],
            dataPool: [],
            userList: [],
            users: [],
            errorMsg: '',
            columns: columns(this),
            totalRecords: 0,
            pageIndex: 0,
            pageLimit: 10,
            apiLoading: false
        }
    },
    created() {
        this.getUserList()
    },
    methods: {
        getUserList() {
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/user/all/base/get/',
                success: this.getUserListSuccess,
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getUserListSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            this.userList = data.sort((a, b) => {
                if (a.username < b.username) return -1
                if (a.username > b.username) return 1
                return 0
            })
            this.handleSearch()
        },
        handleError(response, errMsg = '') {
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        setUerActive(user) {
            if (!user.username) return
            this.userList = this.userList
                .map(item => {
                    if (item.id === user.id) item.active = true
                    else item.active = false
                    return item
                })
            this.handleSearch()
        },
        getLog(user) {
            if (!user.username) return
            const username = user.username
            this.apiLoading = true
            this.reset()
            const _this = this
            const logs = []
            const url = this.$store.state.backendUrl
            const logServer = new EventSource(`${url}/1/pm/c/log/get/?user=${username}`)
            logServer.addEventListener('message', function(e) {
                var data = JSON.parse(e.data)
                if (data.msg === 'closed') {
                    if (logs.length === 0)
                        _this.errorMsg = _this.$t('NoData')
                    else {
                        _this.dataPool = logs
                        _this.totalRecords = _this.dataPool.length
                        _this.setPagination()
                    }
                    logServer.close()
                    _this.apiLoading = false
                }
                else if (data.status || data.status === 0) {
                    var errMsg = ''
                    logServer.close()
                    errMsg = _this.$t('Error.Unexpected')
                    if (data.msg) errMsg += `<br><br>${data.msg}`
                    _this.errorModal(errMsg)
                    _this.apiLoading = false
                }
                else logs.push(data.msg)
            })

            const timeLimit = this.sec(15)
            const timeout = setTimeout(() => {
                if (logServer.readyState === 0) {
                    _this.$Modal.confirm({
                        title: _this.$t('Timeout'),
                        content: _this.$t('Reconnect'),
                        okText: _this.$t('Reload'),
                        cancelText: _this.$t('Cancel'),
                        onOk: () => { location.reload() }
                    })
                    logServer.close()
                }
                clearTimeout(timeout)
            }, timeLimit)

            const chkLogServer = setInterval(() => {
                if (logServer.readyState === 2) {
                    _this.apiLoading = false
                    clearInterval(chkLogServer)
                }
            }, 300)
        },
        setPagination(limit) {
            if (limit) this.pageLimit = limit
            this.logs = []
            this.logs = this.$refs.pagination.handleData(this.dataPool)
        },
        handleSearch() {
            const str = this.search
            this.users = this.userList
                .filter(item => item.username.indexOf(str) > -1)
        },
        resetSearch() {
            this.search = ''
            this.handleSearch()
        },
        rowClassName(row) {
            const level = row.level
            const hasColorProperty = Object.prototype.hasOwnProperty
                .call(this.showColorMap, level)
            if (hasColorProperty)
                return this.showColorMap[level]
            return ''
        },
        reset() {
            this.errorMsg = ''
            this.dataPool = []
            this.logs = []
        }
    }
}
</script>