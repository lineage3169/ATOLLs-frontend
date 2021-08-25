<template>
    <div class="m-api-test">
        <div class="tool-bar mb-10">
            <div class="tool-bar__url">
                <Select v-model="ajaxMethods" class="w-100">
                    <Option v-for="item in methodsList"
                            :value="item.value"
                            :key="item.value"
                            :label="item.label"/>
                </Select>
                <Select v-model="url"
                        placeholder="Enter request URL"
                        filterable
                        allow-create
                        @on-create="addNewUrlList">
                    <Option v-for="(item , index) in atollUrls"
                            :value="item.value"
                            :key="index"
                            :label="item.label"/>
                </Select>
            </div>
            <Button type="primary"
                    :class="'btn btn--long fz--primary'"
                    :disabled="!url"
                    :loading="apiLoading"
                    @click.stop="submitToServer()">
                    {{ $t('Submit') }}
            </Button>
        </div>
        <div class="radioboxBar mb-10 primary">
            <RadioGroup v-model="isCSRF">
                <Radio label="isCSRF" class="mr-20"><span>CSRF</span></Radio>
                <Radio label="isTicket" class="mr-20"><span>ATOLL Ticket</span></Radio>
            </RadioGroup>
            <template v-if="ajaxMethods === 'POST'">
                <Upload action='fake-path' :before-upload="handleUpload">
                    <Button icon="ios-cloud-upload-outline"
                            :style="'width:150px;'">選擇檔案</Button>
                </Upload>
                <div v-if="file" class="file-info">{{ file.name }}</div>
            </template>
        </div>
        <div class="panal">
            <div class="panal__title noselect">
                Params
            </div>
            <div class="params-tool">
                <Input  v-model="params.key"
                        class="params-tool__keyInput mr-20"
                        placeholder="Key"/>
                <Input  v-model="params.value"
                        class="params-tool__valueInput mr-10"
                        placeholder="Value"
                        @keydown.enter="addParams()"/>
                <Button type="primary"
                        class="no-border fz--large"
                        ghost
                        :disabled="disableAddParams()"
                        @click.stop="addParams()">
                    <Icon type="md-add" />
                </Button>
            </div>
            <ul v-if="paramsList.length > 0" class="params-list">
                <li v-for="(item, index) in paramsList"
                    class="params-list__item"
                    :class="{'bg-color--primary':index % 2 === 0}"
                    :key="index">
                    <div class="params-list__item__key mr-20">{{item.key}}</div>
                    <i-input v-model="item.value" class="params-list__item__value"/>
                    <div class="params-list__item__delete cur-point" @click.stop="deleteParams(index)">
                        <Icon type="ios-close" />
                    </div>
                </li>
            </ul>
        </div>
        <div class="panal">
            <div class="panal__title">
                Response
            </div>
            <div class="response-area mt-20">
                <ul v-show="responseContent">
                    <li v-if="responseContent && responseContent.config"><b>url:</b> {{responseContent.config.url}}</li>
                    <li>
                        <span :class="{'bg-color--success': isSuccess(),
                                       'bg-color--error'  : !isSuccess()}">
                            <b>status:</b>{{responseContent.status}}
                        </span>
                    </li>
                    <li>
                        <b>statusText:</b> {{responseContent.statusText}}
                    </li>
                    <li>
                        <pre><code><b>headers:</b>{{responseContent.headers}}</code></pre>
                    </li>
                    <li>
                        <pre><code><b>body:</b>{{responseContent.data}}</code></pre>
                    </li>
                </ul>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: 'ApiTest',
    data() {
        return {
            methodsList: [
                {
                    label: 'GET',
                    value: 'GET'
                },
                {
                    label: 'POST',
                    value: 'POST'
                }
            ],
            ajaxMethods: 'GET',
            isCSRF: 'isCSRF',
            url: '',
            params: {
                key: '',
                value: ''
            },
            paramsList: [],
            responseContent: '',
            ticket: '',
            file: null,
            atollUrls: null,
            apiLoading: false
        }
    },
    created() {
        this.getUrlList()
    },
    methods: {
        getUrlList() {
            const config = {
                method: 'post',
                path: '/1/sys/c/env/urls/get/',
                success: response => {
                    this.atollUrls = this.setUrlList(response.data.data)
                },
                error: this.getUrlListError
            }
            this.ajax(config)
        },
        getUrlListError(response) {
            let errMsg = this.$t('Error.UrlList.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        getAtollTicket() {
            const config = {
                method: 'post',
                path: '/1/sys/c/auth/ticket/get/',
                obj: { ATOLL_API_KEY: '1234' },
                success: response => { this.ticket = response.data.data },
                error: this.getAtollTicketError
            }
            return this.ajax(config)
        },
        setUrlList(urls = []) {
            const urlList = []
            urls.forEach((item) => {
                const obj = {
                    label: item,
                    value: item
                }
                urlList.push(obj)
            })
            return urlList
        },
        addParams() {
            const input = this.deepCopy(this.params)
            this.paramsList.push(input)
            this.params.key = ''
            this.params.value = ''
        },
        async submitToServer() {
            const methodAciton = this.ajaxMethods.toLowerCase() || 'none'
            const paramsObj = {}
            this.responseContent = ''
            if (!this.url) return
            if (methodAciton !== 'post' && methodAciton !== 'get') return

            if (methodAciton === 'get') paramsObj.params = {}

            // support repeat key (params type of array)
            const obj = this.paramsList.reduce((accumulator, current) => {
                const key = current.key
                if (!accumulator[key]) accumulator[key] = []
                accumulator[key].push(current.value)
                return accumulator
            }, {})

            for (const key in obj) {
                let value = obj[key]
                if (obj[key].length === 1)
                    [value] = obj[key]
                if (methodAciton === 'get')
                    paramsObj.params[key] = value
                else paramsObj[key] = value
            }
            const headersObj = {}
            if (this.isCSRF === 'isTicket') {
                await this.getAtollTicket()
                headersObj.AUTHORIZATION = 'ATOLLs ' + this.ticket
            }
            if (this.isCSRF === 'isCSRF') headersObj['X-CSRFToken'] = this.$store.state.csrfToken

            const fromData = new FormData()
            if (Object.keys(paramsObj).length > 0 && methodAciton === 'post') {
                for (const key in paramsObj)
                    fromData.append(key, paramsObj[key])
            }
            if (this.file) fromData.append('file', this.file)
            let params = {}
            methodAciton === 'post' ? params = fromData : params = paramsObj

            this.apiLoading = true
            const backendUrl = this.$store.state.backendUrl
            const url = `${backendUrl}/${this.url.replace(/a\//, '')}`
            this.$http[methodAciton](url, params, { headers: headersObj })
                .then(this.handleSuccess, this.handleError)
                .catch(this.handleError)
                .finally(() => { this.apiLoading = false })
        },
        deleteParams(index) {
            this.paramsList.splice(parseInt(index), 1)
        },
        isSuccess() {
            const statusNum = parseInt(this.responseContent.status) || 0
            let status = false
            if (statusNum === 200)
                status = true
            return status
        },
        addNewUrlList(data) {
            this.atollUrls.push({
                value: data,
                label: data
            })
        },
        handleSuccess(response) {
            this.responseContent = response
            if (this.checkContentType(response)) {
                this.responseContent.status = 404
                this.responseContent.ok = false
            }
        },
        handleError(error) {
            this.responseContent = error.response
        },
        checkContentType(response) {
            const contentType = response.headers['content-type']
            const isErrorURL = contentType.indexOf('text/html; charset=utf-8') > -1
            return isErrorURL
        },
        disableAddParams() {
            if (!this.params.key)
                return true
            if (!this.params.value)
                return true
            return false
        },
        handleUpload(file) {
            this.file = file
            return false
        }
    }
}
</script>