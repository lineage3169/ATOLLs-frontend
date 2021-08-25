<template>
    <div class="p-config">
        <Spin v-show="apiLoading" size="large" fix />
        <div class="tools">
            <Input v-model="search"
                    class="w-250"
                    clearable
                    search
                    :placeholder="`${$t('Quick')}${$t('Search')}...`"
                    @input="filterData" />
            <div v-if="dataPool && dataPool.length > 0" class="records">
                {{ dataPool.length + $t('Records') + $t('Data') }}
            </div>
        </div>
        <div class="groups-container noselect">
            <div class="group__item group__item--add"
                @click.stop="createShow = true">
                <div class="add__item">
                    <div class="icon">
                        <Icon type="md-add" />
                    </div>
                    <div class="title">
                        {{$t('Add') + $t('Area')}}
                    </div>
                </div>
            </div>
            <div v-for="(item,index) in area"
                class="group__item"
                :key="index">
                <div class="group__item__alias">
                    {{ item.name }}
                </div>
                <div class="group__item__name">
                    {{ item.group }}
                </div>
                <div class="group__item__info">
                    <div class="space">
                        <div class="icon">
                            P
                        </div>
                        <div class="count">
                            {{ item.count }}
                        </div>
                    </div>
                </div>
                <div class="group__item__action">
                    <div class="action__item"
                        @click.stop="deleteConfirm(item)">
                        <div class="icon">
                            <Icon type="ios-trash-outline" />
                        </div>
                        <div class="title">
                            {{ $t('Delete') }}
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <!-- Create Modal -->
        <CreateArea v-model="createShow" @refresh="getData"/>
        <!-- Delete Modal -->
        <DeleteConfirm v-model="deleteShow"
            :msg="deleteAreaName"
            :loading="deleteLoading"
            :on-ok="deleteArea"/>
    </div>
</template>
<script>
import CreateArea from '@/components/modal/area-create'
import DeleteConfirm from '@/components/modal/confirm/delete'
export default {
    name: 'AreaMgnt',
    components: { DeleteConfirm, CreateArea },
    data() {
        return {
            groupInfo: {},
            search: '',
            deleteAreaName: '',
            deleteItem: null,
            dataPool: [],
            area: [],
            createShow: false,
            deleteShow: false,
            apiLoading: false,
            deleteLoading: false
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.dataPool = []
            this.area = []
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/pm/c/pg/get/',
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.apiLoading = false }
            }
            return this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            this.dataPool = data.map(item => {
                item.count = item?.ps_info?.counts
                    ? item.ps_info.counts
                    : 0
                return item
            })
            this.filterData()
        },
        getDataError(response) {
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
        deleteConfirm(item) {
            if (item.count > 0) {
                // 該區域車位需為0才能刪除
                const msg = this.$t('Modal.DeleteParkingArea.Msg1')
                return this.errorModal(msg)
            }
            this.deleteAreaName = `${item.name}`
            this.deleteItem = item
            this.deleteShow = true
        },
        deleteArea() {
            this.deleteLoading = true
            const config = {
                method: 'post',
                path: '/1/pm/c/pg/delete/',
                obj: { pg_id: this.deleteItem.id },
                success: () => {
                    const successMsg = this.$t('Delete') + this.$t('Success')
                    this.$Message.success(successMsg)
                    this.dataPool = this.dataPool
                        .filter(item => item.id !== this.deleteItem.id)
                    this.filterData()
                    this.deleteShow = false
                },
                error: this.deleteAreaError,
                final: () => { this.deleteLoading = false }
            }
            this.ajax(config)
        },
        deleteAreaError(response) {
            let errMsg = this.$t('Error.DeleteArea.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供停車區域ID
                case 1:
                    errMsg += this.$t('Error.DeleteArea.Code1')
                    break
                // 此停車區域尚有停車位未刪除
                case 2:
                    errMsg += this.$t('Error.DeleteArea.Code2')
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
        filterData() {
            const str = this.search
            this.area = this.dataPool
                .filter(item => item.name.indexOf(str) > -1 || item.group.indexOf(str) > -1)
        }
    }
}
</script>