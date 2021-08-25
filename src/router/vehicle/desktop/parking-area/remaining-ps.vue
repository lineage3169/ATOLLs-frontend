<template>
    <div class="p-remaining-parking-space">
        <Spin v-show="apiLoading" size="large" fix />
        <div class="tools">
            <Input v-model="search"
                    class="w-250"
                    clearable
                    search
                    :placeholder="`${$t('Quick')}${$t('Search')}...`"
                    @input="quickSearch" />
            <div v-if="dataPool && dataPool.length > 0" class="records">
                {{ dataPool.length + $t('Records') + $t('Data') }}
            </div>
        </div>
        <div class="garages-container">
            <div v-for="(item, index) in data"
                class="garages"
                :class="{ 'garages--full': item.isFull }"
                :key="index">
                <div class="garages__label">
                    {{ item.name }}
                </div>
                <div class="garages__content">
                    <div class="garages__content__count">
                        {{ item.count }}
                    </div>
                    <!-- 滿 -->
                    <div v-if="item.isFull"
                        class="garages__content__info">
                        <span>{{ $t('Full') }}</span>
                    </div>
                    <!-- 剩餘N車位 -->
                    <div v-else
                        class="garages__content__info">
                        {{ $t('Remaining') }}<span>{{ item.remaining }}</span>{{ $t('ParkingSpace') }}
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'RemainingParkingSpace',
    data() {
        return {
            search: '',
            data: [],
            dataPool: [],
            interval: null,
            apiLoading: false
        }
    },
    async created() {
        await this.getData()
        this.quickSearch()
    },
    mounted() {
        const sec = 1000
        this.interval = setInterval(async () => {
            await this.getData()
            this.quickSearch()
        }, 60 * sec)
    },
    methods: {
        getData() {
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/pm/c/pg/get/',
                success: this.setData,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        setData(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            this.dataPool = data
                .map(item => {
                    const used = item?.ps_info?.used_counts
                        ? item.ps_info.used_counts
                        : 0
                    const counts = item?.ps_info?.counts
                        ? item.ps_info.counts
                        : 0
                    item.isFull = used >= counts
                    item.count = `${used} / ${counts}`
                    item.remaining = counts - used
                    return item
                })
        },
        getDataError(response) {
            this.clearInterval()
            let errMsg = this.$t('Error.GetArea.General') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        quickSearch() {
            const str = this.search
            this.data = this.dataPool
                .filter(item => item.name.indexOf(str) > -1 || item.group.indexOf(str) > -1)
        },
        clearInterval() {
            if (this.interval) clearInterval(this.interval)
        }
    },
    beforeDestroy() {
        this.clearInterval()
    }
}
</script>