<template>
    <div class="p-factory">
        <div class="l-view">
            <div class="pb-15">
                <Button class="btn fz--large"
                        @click.stop="downloadExample()">
                        <Icon type="md-download" />
                        {{ $t('Example') + $t('File') }}
                </Button>
            </div>
            <Upload multiple
                    type="drag"
                    :headers="{'X-CSRFToken':csrfToken}"
                    :class="{'upload--disabled':uploadDisabled()}"
                    :disabled="uploadDisabled()"
                    :action="actionPath"
                    :data="data"
                    :format="allowFormat"
                    :max-size="1024 * limitSize"
                    :on-format-error="formatErrorAlert"
                    :on-exceeded-size="maxSizeAlert"
                    :on-error="uploadErrorAlert">
                <div style="padding: 60px;">
                    <Icon type="md-cloud-upload" size="120" style="color: #0D8EA8;"></Icon>
                    <p v-show="!uploadDisabled()"
                        class="fz--huge">
                        {{ $t('Notice.UploadNotice') }}
                    </p>
                    <p v-show="uploadDisabled()"
                        class="fz--huge txt-color--error">
                        {{ $t('Error.NotGetOutsourcing') }}
                    </p>
                </div>
            </Upload>
        </div>
    </div>
</template>

<script>
const FileSaver = require('file-saver')
export default {
    name: 'InspPackageUpdate',
    data() {
        return {
            actionPath: this.$store.state.backendUrl + '/1/ins/c/data/progress/PA/O/upload/',
            allowFormat: ['xlsx'],
            limitSize: 1, // MB
            data: {},
            csrfToken: this.$store.state.csrfToken
        }
    },
    created() {
        const { outsourcing = '' } = this.$store.state.profile || {}
        if (outsourcing) this.data.outsourcing_id = outsourcing
    },
    methods: {
        downloadExample() {
            const config = {
                method: 'get',
                path: '/1/ins/c/others/progress-upload-example/download/',
                type: 'blob',
                success: this.downloadExampleSuccess,
                error: this.downloadExampleError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        downloadExampleSuccess(response) {
            const { 'content-disposition': disposition } = response.headers
            let filename = 'ORDER_ID.xlsx'
            if (disposition && disposition.indexOf('filename=') > -1) {
                filename = disposition.replace(/\"/g, '')
                    .split('filename=')[1]
            }
            const file = new Blob([response.data])
            FileSaver.saveAs(file, filename)
        },
        downloadExampleError(response) {
            console.error(response)
            const msg = this.$t('File') + this.$t('Download') + this.$t('Failed')
            this.$Message.error(msg)
        },
        formatErrorAlert(file) {
            this.$Modal.warning({
                title: this.$t('Notice.UploadIncorrectFormatB'),
                content: this.$t('Notice.UploadIncorrectFormatA') + this.allowFormat.join(', '),
                okText: this.$t('OK')
            })
        },
        maxSizeAlert(file) {
            this.$Modal.warning({
                title: this.$t('Notice.UploadExceedFileSizeB'),
                content: this.$t('Notice.UploadExceedFileSizeA') + this.limitSize + ' MB',
                okText: this.$t('OK')
            })
        },
        uploadErrorAlert(response, msg) {
            const res = this.deepCopy(response)
            const uploadErrorMsg = this.$t('Error.UploadProgress.General')
            let errMsg = ''
            if (res.status === 400) {
                switch (parseInt(msg.code)) {
                case 1:
                    // 無效的檔案格式
                    errMsg = this.$t('Error.UploadProgress.Code1')
                    break
                case 2:
                    // 無效的進度
                    errMsg = this.$t('Error.UploadProgress.Code2')
                    break
                case 3:
                    // 查無此工單
                    errMsg = this.$t('Error.UploadProgress.Code3')
                    break
                case 4:
                    // 上傳失敗，資訊不足
                    errMsg = this.$t('Error.UploadProgress.Code4')
                    break
                case 5:
                    // 該工單不存在於資料庫
                    errMsg = this.$t('Error.UploadProgress.Code5')
                    break
                case 6:
                    // 實體條碼不存在於資料庫
                    errMsg = this.$t('Error.UploadProgress.Code6')
                    break
                default:
                    // 未預期的錯誤
                    errMsg = `${uploadErrorMsg}<br>${this.$t('Error.Unexpected')}`
                    break
                }
            }
            else {
                errMsg = `${uploadErrorMsg} (${res.status})`
                errMsg += `<br>${msg || this.$t('Error.Unexpected')}`
            }
            this.errorModal(errMsg)
            console.error(res, msg)
        },
        uploadDisabled() {
            const { outsourcing = '' } = this.$store.state.profile || {}
            if (!outsourcing) return true
            else return false
        }
    }
}
</script>