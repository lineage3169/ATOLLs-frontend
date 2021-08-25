<template>
    <Modal v-model="logModal"
            :width="1024"
            :closable="false">
        <div class="fz--large" slot="header">
           {{ $t('Object') + $t('Log') }}
        </div>
        <div class="txt-center">
            <div class="spin-container">
                <Table stripe
                        :no-data-text="$t('NoData')"
                        :columns="logColumns"
                        :data="logs"/>
                <Spin v-if="spinShow" size="large" fix/>
            </div>
        </div>
        <div slot="footer">
            <Button class="btn btn--outline"
                    size="large"
                    long
                    @click="logModal = false">
                {{ $t('OK') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'LogModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        id: {
            type: String,
            required: true
        }
    },
    data() {
        return {
            logModal: false,
            logColumns: [
                {
                    title: this.$t('Date'),
                    width: 180,
                    key: 'create_time'
                },
                {
                    title: this.$t('Level'),
                    key: 'level',
                    width: 100,
                    render: (h, params) => {
                        return h('p', this.levelMap[params.row.level])
                    }
                },
                {
                    title: 'IP',
                    width: 150,
                    key: 'ip'
                },
                {
                    title: this.$t('User'),
                    width: 150,
                    key: 'user'
                },
                {
                    title: this.$t('Message'),
                    key: 'message'
                }
            ],
            logs: [],
            levelMap: {
                0: 'NOTSET',
                10: 'DEBUG',
                20: this.$t('INFO'),
                30: this.$t('WARNING'),
                40: this.$t('ERROR'),
                50: this.$t('FATAL')
            },
            spinShow: false
        }
    },
    methods: {
        getData(id) {
            const _this = this
            this.logs = []
            this.spinShow = true
            const url = _this.$store.state.backendUrl
            const logsArr = []
            const logServer = new EventSource(`${url}/1/obj/c/log/${id}/get/`)
            logServer.addEventListener('message', function(e) {
                var data = JSON.parse(e.data)
                if (data.msg === 'closed') {
                    if (logsArr.length === 0)
                        _this.errorMsg = _this.$t('NoData')
                    else {
                        _this.errorMsg = ''
                        _this.logs = logsArr
                    }
                    logServer.close()
                }
                else if (data.status || data.status === 0) {
                    var errMsg = ''
                    logServer.close()
                    errMsg = _this.$t('Error.Unexpected')
                    if (data.msg) errMsg += `<br><br>${data.msg}`
                    _this.errorModal(errMsg)
                }
                else logsArr.push(data.msg)
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

            const chkLogServer = setInterval(function() {
                if (logServer.readyState === 2) {
                    _this.spinShow = false
                    clearInterval(chkLogServer)
                }
            }, 300)
        }
    },
    watch: {
        value(data) {
            this.logModal = data
        },
        logModal(data) {
            this.$emit('input', data)
        },
        id(val, oldVal) {
            if (val !== oldVal) this.getData(val)
        }
    }
}
</script>