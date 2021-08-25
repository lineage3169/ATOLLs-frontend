<template>
    <div class="m-system-config bg-color--white">
        <!-- 自定義 -->
        <div class="panal">
            <div class="panal__title">
                {{ $t('Upload') }}
            </div>
            <!-- 難字上傳 -->
            <div class="panal__items no-border h-150 bg-color--white br-5--bottom">
                <div class="panal__items__title">
                    {{$t('UserFonts')}}
                </div>
                <div class="panal__items__content">
                    <Upload style="width: 100%; margin-top:5px;"
                            type="drag"
                            ref="upload"
                            :action="actionPath"
                            :headers="uploadPostHeaders"
                            :format="allowFormat"
                            :on-success="handleSuccess"
                            :on-error="handleUploadErr"
                            :on-format-error="handleFormatErr">
                        <div style="height: 80px;padding-top:10px;">
                            <Icon type="ios-cloud-upload" style="color:#0D8EA8;" size="36"/>
                            <p>{{$t('UploadDepiction')}}</p>
                        </div>
                    </Upload>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ConfigHardwords',
    data() {
        return {
            actionPath: this.$store.state.backendUrl + '/1/sys/c/env/hardwords/',
            allowFormat: ['ttf', 'tte'],
            uploadPostHeaders: {
                'X-CSRFToken': this.$store.state.csrfToken
            }
        }
    },
    methods: {
        disableActive() {
            let verify = false
            const licenseCode = ['licenseCode1', 'licenseCode2',
                'licenseCode3', 'licenseCode4']
            verify = licenseCode.some(key => this[key].length !== 5)
            return verify
        },
        focusInput(value, index) {
            const id = `code_${index}`
            const ipInput = document.getElementById(id).children[1]
            if (value.length === 5) ipInput.focus()
        },
        handleSuccess(response, file, fileList) {
            const successMsg = this.$t('Modal.UploadSuccess')
            const reloadMsg = this.$t('Modal.ReloadWeb')
            this.$Modal.success({
                title: this.$t('INFO'),
                content: `${successMsg}<br>${reloadMsg}`,
                okText: this.$t('OK')
            })
            this.$refs.upload.clearFiles()
        },
        handleFormatErr(file, fileList) {
            this.$Modal.error({
                title: this.$t('FileFormatErr'),
                content: this.$t('Modal.FileFormatErr'),
                okText: this.$t('OK')
            })
        },
        handleUploadErr(error, file, fileList) {
            console.error(error)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: this.$t('Modal.UploadError'),
                okText: this.$t('OK')
            })
        }
    }
}
</script>