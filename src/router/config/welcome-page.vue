<template>
    <div class="p-welcome-page">
        <Spin v-show="apiLoading" size="large" fix />
        <div class="tool mt-20 mb-30">
            <div class="search">
                <i-input v-model="search"
                        class="w-200"
                        type="text"
                        clearable
                        icon="md-search"
                        :placeholder="`${$t('Quick')}${$t('Search')}...`"
                        @input="handleSearch"/>
            </div>
        </div>
        <div class="groups-list">
            <div v-for="(item, index) in groups"
                class="groups-item"
                :key="index">
                <div class="groups-item__label">
                    {{ `${item.alias} - ${item.name}` }}
                </div>
                <div class="groups-item__content">
                    <img v-if="item.image" :src="item.image">
                    <img v-else src="../../assets/images/welcome-page.jpg">
                    <div class="groups-item__content__title">
                        {{ item.alias }}
                    </div>
                    <div class="groups-item__content__info">
                        存車管理系統
                    </div>
                    <div class="groups-item__content__button">
                        <Button class="btn btn--outline"
                            @click.stop="handleConfig(item)">
                            {{ $t('Config') }}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        <ImageClipper v-model="clipperShow"
            :group="selectedGroup"
            @on-success="getGroups"/>
    </div>
</template>
<script>
import ImageClipper from '@/components/modal/image-clipper.vue'
export default {
    name: 'ConfigWelcomePage',
    components: { ImageClipper },
    data() {
        return {
            imgURL: this.$store.state.backendUrl + '/1/pm/c/others/image/get/',
            search: '',
            selectedGroup: null,
            groupList: [],
            groups: [],
            clipperShow: false,
            apiLoading: false
        }
    },
    created() {
        this.getGroups()
    },
    methods: {
        getGroups() {
            this.groupList = []
            this.groups = []
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/groups/get/',
                success: response => {
                    if (!response?.data?.data) return
                    this.setData(response)
                    this.handleSearch()
                },
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        setData(response) {
            const { data: { data } } = response
            this.groupList = data.map(item => {
                item.image = ''
                if (item?.profile?.images && item.id) {
                    const src = this.imgURL + `?id=${item.id}&image=`
                    const [filename] = item.profile.images
                    item.image = src + filename
                }
                return item
            })
        },
        handleError(response) {
            let errMsg = this.$t('Error.Groups.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        handleSearch() {
            const str = this.search
            this.groups = this.groupList
                .filter(item => item.name.indexOf(str) > -1 || item.alias.indexOf(str) > -1)
        },
        handleConfig(group) {
            if (!group) return
            this.selectedGroup = group
            this.clipperShow = true
        }
    }
}
</script>