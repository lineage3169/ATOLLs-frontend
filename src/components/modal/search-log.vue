<template>
    <Modal v-model="logModal"
            :width="1024"
            :closable="false">
        <div class="fz--large" slot="header">
           {{ $t('PolicyLog') }}
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
                    key: 'date'
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
                    key: 'message',
                    render: (h, params) => {
                        // component 註冊於 main.js
                        return h('logMsg', {
                            props: {
                                str: params.row.message
                            }
                        })
                    }
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
        getData(insID) {
            const _this = this
            _this.logs = []
            _this.spinShow = true
            const logServer = new EventSource(this.$store.state.backendUrl + '/1/obj/c/log/' + insID + '/get/')
            logServer.addEventListener('message', function(e) {
                var data = JSON.parse(e.data)

                if (data.msg === 'closed') logServer.close()
                else if (data.error) {
                    var errMsg = ''
                    logServer.close()
                    if (data.error === '400') errMsg = data.msg
                    else errMsg = 'Error code: ' + data.error
                    _this.$Message.error(errMsg)
                    console.error(data.error + ':' + data.msg)
                }
                else _this.logs.push(data.msg)
            })

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