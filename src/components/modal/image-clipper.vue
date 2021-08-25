<template>
    <Modal v-model="show"
            class="p-image-clipper"
            :width="800">
        <div slot="header" class="fz--large">
            <!-- 設定圖片 -->
            {{ $t('Config') + $t('Picture') }}
        </div>
        <div>
            <clipper-upload v-model="imgURL" class="mb-20">
                <Button class="btn btn--outline">
                    <!-- 上傳圖片 -->
                    {{ $t('Upload') + $t('Picture') }}
                </Button>
            </clipper-upload>
            <clipper-basic class="clipper"
                ref="clipper"
                :src="imgURL"
                :ratio="9 / 20">
                <div class="placeholder"
                    slot="placeholder">
                    <!-- 點擊左上角 "上傳圖片" 按鈕 -->
                    {{ $t('PlaceHolder.Clipper') }}
                </div>
            </clipper-basic>
        </div>
        <div slot="footer">
            <Button size="large"
                    class="btn btn--outline"
                    @click.stop="show = false">
                {{ $t('Cancel') }}
            </Button>
            <Button size="large"
                    class="btn"
                    :disabled="!imgURL"
                    :loading="apiLoading"
                    @click.stop="handleClick()" >
                {{ $t('Clip&Save') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'ImageClipper',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        group: {
            type: Object
        }
    },
    data() {
        return {
            id: null,
            file: null,
            imgURL: '',
            show: false,
            apiLoading: false
        }
    },
    methods: {
        async handleClick() {
            const file = await this.getResult()
            this.upload(file)
        },
        getResult() {
            const canvas = this.$refs.clipper.clip()
            return new Promise(resolve => {
                canvas.toBlob(blob => { resolve(blob) }, 'image/jpeg')
            })
        },
        upload(file) {
            if (!this.id ?? null) return
            if (!file) return
            this.apiLoading = true
            const sec = 1000
            const fromData = new FormData()
            fromData.append('id', this.id)
            fromData.append('file', file, 'clipper.jpeg')
            const config = {
                method: 'post',
                path: '/1/pm/c/others/images/upload/',
                fromData: fromData,
                timeout: 60 * sec,
                success: () => {
                    const content = this.$t('Upload') + this.$t('Success')
                    this.$Message.success(content)
                    this.show = false
                    this.$emit('on-success')
                },
                error: this.uploadFileError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            if (data) this.imgURL = ''
            this.$emit('input', data)
        },
        group(data) {
            if (!data?.id) return
            this.id = data.id
        }
    }
}
</script>