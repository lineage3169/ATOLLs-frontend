<template>
    <router-view></router-view>
</template>

<script>
import '@/assets/css/app.scss'

export default {
    created() {
        this.getModuleType()
    },
    methods: {
        loadingOn() {
            const body = document.body
            const loader = document
                .createElement('div')
            const block = document
                .createElement('div')
            loader.setAttribute('class', 'loader loader--pm')
            block.setAttribute('class', 'c-permission-block c-permission-block--white')
            block.setAttribute('id', 'loading-block')
            block.appendChild(loader)
            body.appendChild(block)
        },
        loadingOff() {
            const block = document.getElementById('loading-block')
            if (block)
                block.parentNode.removeChild(block)
        },
        async getModuleType() {
            this.loadingOn()
            const config = {
                method: 'post',
                path: '/1/sys/c/license/features/get/',
                success: this.getModuleTypeSuccess
            }
            await this.ajax(config)
            this.loadingOff()
        },
        getModuleTypeSuccess(response) {
            if (!response?.data?.data) return
            const { data: { data } } = response
            const moduleType = [...new Set(data.split(',')
                .filter(item => item.split('@').length === 3)
                .map(item => item.split('@')[2]))]
            const isParkingMgnt = moduleType.indexOf('PM') > 0 && moduleType.indexOf('INS') === -1
            const body = document.body
            if (isParkingMgnt) {
                const param = {
                    param: 'moduleType',
                    data: 'PM'
                }
                this.$store.commit('updateData', param)
                body.setAttribute('class', 'pm-module')
                document.title = this.$t('SystemName.Benz')
            }
            else {
                body.classList.remove('pm-module')
                document.title = 'ATOLLs'
            }
        }
    }
}
</script>