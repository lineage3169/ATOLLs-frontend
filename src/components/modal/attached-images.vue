<template>
    <Modal v-model="show"
            class="p-attached-images-modal"
            footer-hide
            :width="msg ? 300 : 1024">
        <div class="fz--large" slot="header">
            <!-- 附件 -->
           {{ $t('AttachedFile') }}
        </div>
        <div v-if="msg" class="error-msg fz--primary">
            {{ msg }}
        </div>
        <div v-show="view === 'LIST'"
            class="img-list">
            <div v-for="(item, index) in list"
                class="img-list__item"
                :key="index"
                @click.stop="handleClick(index)">
                <div class="img-list__item__mask"></div>
                <img :src="item.thumbnail"/>
            </div>
        </div>
        <template v-if="list.length > 0">
            <VueSlickCarousel
                v-show="view === 'CARROUSEL'"
                v-bind="option"
                class="mr-30 ml-30"
                ref="carousel">
                <div v-for="(item, index) in list" :key="index">
                    <img :src="item.origin" />
                </div>
            </VueSlickCarousel>
        </template>
    </Modal>
</template>
<script>
import VueSlickCarousel from 'vue-slick-carousel'
import 'vue-slick-carousel/dist/vue-slick-carousel.css'
import 'vue-slick-carousel/dist/vue-slick-carousel-theme.css'
export default {
    name: 'AttachedImages',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        vehicle: {
            type: Object
        }
    },
    components: { VueSlickCarousel },
    data() {
        return {
            view: 'LIST',
            imgURL: this.$store.state.backendUrl + '/1/pm/c/others/image/get/',
            msg: '',
            uid: '',
            list: [],
            option: {
                lazyLoad: 'ondemand',
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1,
                dots: true,
                fade: true
            },
            show: false,
            apiLoading: false
        }
    },
    methods: {
        getImagesList() {
            if (!this.uid) return
            this.msg = ''
            this.list = []
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/pm/c/others/images/thumbnail/get',
                obj: { id: this.uid },
                success: this.getImagesListSuccess,
                error: this.getImagesListError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        getImagesListSuccess(response) {
            if (!response?.data?.data) return
            if (response.data.data.length === 0) {
                this.msg = this.$t('NoAttached')
                return
            }
            this.list = response.data.data
                .map(filename => {
                    const url = this.imgURL + `?id=${this.uid}`
                    const originFilename = filename.replace(/Thumbnail_/g, '')
                    const obj = {
                        thumbnail: url + `&image=${filename}`,
                        origin: url + `&image=${originFilename}`
                    }
                    return obj
                })
        },
        getImagesListError(response) {
            let errMsg = this.$t('Error.ImagesList.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                // 未提供物件ID
                case 1:
                    errMsg += this.$t('Error.ImagesList.Code1')
                    break
                // 查無此物件
                case 2:
                    errMsg += this.$t('Error.ImagesList.Code2')
                    break
                // 未找到圖檔於伺服器
                case 3:
                    errMsg += this.$t('Error.ImagesList.Code3')
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
        handleClick(index) {
            this.$refs.carousel.goTo(index)
            this.view = 'CARROUSEL'
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            this.$emit('input', data)
            if (data) this.view = 'LIST'
        },
        vehicle(data) {
            this.uid = data?.id
            this.getImagesList()
        }
    }
}
</script>