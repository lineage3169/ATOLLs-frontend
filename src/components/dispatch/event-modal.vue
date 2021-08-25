<template>
    <Modal v-model="eventModalShow"
           :width="1024"
           :class-name="'m-dispatch-event-modal'">
        <div class="fz--large" slot="header">
           {{ `${$t('Dispatch')}${$t('Information')}` }}
        </div>
        <div class="form">
            <div v-for="(item,index) in infoData" class="form__items" :key="index">
                <div class="form__items__label">{{labelMap[item.label]}}</div>
                <div class="form__items__content" :title="item.value">{{item.value}}</div>
            </div>
        </div>
        <div slot="footer">
            <Button class="btn btn--outline"
                    size="large"
                    long
                    @click="eventModalShow = false">
                     {{ $t('OK') }}
            </Button>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'EventModal',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        eventInfo: {
            type: Array,
            required: true
        }
    },
    data() {
        return {
            infoData: [],
            eventModalShow: false,
            labelMap: {
                projectName: this.$t('Project') + this.$t('Name'),
                projcetDesc: this.$t('Project') + this.$t('Description'),
                outsourcingName: `${this.$t('Outsourcing')}${this.$t('Company')}${this.$t('Name')}`,
                outsourcingAlias: `${this.$t('Outsourcing')}${this.$t('Company')}${this.$t('Alias')}`,
                uploadPath: this.$t('Upload') + this.$t('Path'),
                downloadPath: this.$t('Download') + this.$t('Path'),
                ip: 'IP',
                days: this.$t('Date')
            }
        }
    },
    methods: {
        hendlePropsData(data) {
            const _this = this
            const infoObj = {
                projectName: '',
                projcetDesc: '',
                outsourcingName: '',
                outsourcingAlias: '',
                uploadPath: '',
                downloadPath: '',
                ip: '',
                days: ''
            }
            const verifyValue = function(value) {
                if (value) return value
                else return _this.$t('NoData')
            }
            const [firstData] = data
            const days = [...new Set(data.map(item => item.day))]
            days.sort((a, b) => a - b)
            infoObj.projectName = verifyValue(firstData.project.name)
            infoObj.projcetDesc = verifyValue(firstData.project.description)
            infoObj.outsourcingName = verifyValue(firstData.outsourcing.name)
            infoObj.outsourcingAlias = verifyValue(firstData.outsourcing.alias)
            infoObj.uploadPath = verifyValue(firstData.outsourcing.upload_path)
            infoObj.downloadPath = verifyValue(firstData.outsourcing.download_path)
            infoObj.ip = verifyValue(firstData.outsourcing.ip_address)
            infoObj.days = days.join(', ')
            const arr = []
            for (const key in infoObj) {
                const obj = {
                    label: key,
                    value: infoObj[key]
                }
                arr.push(obj)
            }
            this.infoData = arr
        }
    },
    watch: {
        value(data) {
            this.eventModalShow = data
        },
        eventModalShow(data) {
            this.$emit('input', data)
        },
        eventInfo(data) {
            if (data && data.length > 0) this.hendlePropsData(data)
        }
    }
}
</script>