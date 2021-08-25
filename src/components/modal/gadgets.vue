<template>
    <Modal v-model="show"
        class="gadgets-modal"
        footer-hide
        :width="650">
        <div slot="header" class="fz--large">
            {{ $t('Gadgets') }}
        </div>
        <div class="gadgets">
            <div v-for="(item, index) in receive"
                class="gadgets-item"
                :key="index">
                <div class="gadgets-item__status"
                    :class="{'gadgets-item__status--true':item.status,
                            'gadgets-item__status--false':!item.status }">
                    <Icon v-if="item.status"
                        type="md-checkmark" />
                    <Icon v-else
                        type="md-close" />
                </div>
                <div class="gadgets-item__label">
                    <template v-if="item.key === 'keys'">
                        {{ `${item.label} ${item.value ? item.value : ''}`}}
                    </template>
                    <template v-else-if="item.key === 'license_frame'">
                        {{ `${$t('LicenseFrame')}： ${item.value ? item.value : '__'} ${$t('AndA')}${$t('FootPad')}` }}
                    </template>
                    <template v-else>
                        {{ item.label }}
                    </template>
                </div>
            </div>
        </div>
    </Modal>
</template>
<script>
export default {
    name: 'Gadgets',
    props: {
        value: {
            type: Boolean,
            default: false
        },
        vehicle: {
            type: Object
        }
    },
    data() {
        return {
            receive: [],
            show: false
        }
    },
    methods: {
        setReceive(data) {
            this.receive = [
                {
                    // 鑰匙
                    key: 'keys',
                    label: this.$t('Key'),
                    status: data.keys > 0,
                    value: data.keys
                },
                {
                    // 點菸器
                    key: 'car_lighter',
                    label: this.$t('CarLighter'),
                    status: data.car_lighter
                },
                {
                    // 啟動按鈕
                    key: 'start_button',
                    label: this.$t('StartButton'),
                    status: data.start_button
                },
                {
                    // 交車禮、牌照登記書
                    key: 'registration_form',
                    label: this.$t('RegistrationForm'),
                    status: data.registration_form
                },
                {
                    // 車主手冊、急救包
                    key: 'ownder_manul',
                    label: this.$t('OwnerManual'),
                    status: data.ownder_manul
                },
                {
                    // SD卡
                    key: 'sd_card',
                    label: this.$t('SdCard'),
                    status: data.sd_card
                },
                {
                    // 三角警示牌
                    key: 'warning_triangle',
                    label: this.$t('WarningTriangle'),
                    status: data.warning_triangle
                },
                {
                    // 置物籃、掛網
                    key: 'storage_basket',
                    label: this.$t('StorageBasket'),
                    status: data.storage_basket
                },
                {
                    // 打氣機、補胎劑
                    key: 'pump',
                    label: this.$t('Pump'),
                    status: data.pump
                },
                {
                    // 天線、音源線
                    key: 'antenna',
                    label: this.$t('Antenna'),
                    status: data.antenna
                },
                {
                    // 前檔油墨清除劑
                    key: 'film_remover',
                    label: `${this.$t('FilmRemover')} x 3`,
                    status: data.film_remover
                },
                {
                    // 車牌架: __ 及腳踏墊
                    key: 'license_frame',
                    label: this.$t('LicenseFrame'),
                    status: data.license_frame.length > 0,
                    value: data.license_frame
                },
                {
                    // 拖車勾
                    key: 'trailer_hook',
                    label: this.$t('TrailerHook'),
                    status: data.trailer_hook
                }
            ]
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            this.$emit('input', data)
        },
        vehicle(data) {
            if (data?.custom?.receive)
                this.setReceive(data.custom.receive)
        }
    }
}
</script>