<template>
<div class="p-welcome">
    <div class="container">
        <div class="logo">
            <img v-if="isParkingMgnt"
                src="../../assets/images/logo-benz.svg"
                alt="Benz logo">
            <img v-else src="../../assets/images/logo.png" alt="ATOLLs logo">
        </div>
        <div class="title">
            <p v-if="isParkingMgnt"
                class="highlight-color mt-30">
                {{ $t('SystemName.Benz') }}
            </p>
            <template v-else>
                <p class="txt-color">Hi!
                    <span class="highlight-color">{{user}}</span>
                    welcome to ATOLLs
                </p>
                <p class="txt-color">Make ATOLLs better, please
                    <a class="highlight-color" href="mailto:ed3169@fucotech.com.tw">email</a>
                    us
                </p>
            </template>
        </div>
        <div v-if="isParkingMgnt" class="powered-by">
            Powered by
            <a class="highlight-color" href="mailto:ed3169@fucotech.com.tw">
                ATOLLs
            </a>
             Fuco Technology Corp.
        </div>
    </div>
</div>
</template>

<script>
export default {
    name: 'Frontend',
    data() {
        return {
            user: this.$store.state.username
        }
    },
    computed: {
        isParkingMgnt() {
            return this.$store.state.moduleType === 'PM'
        }
    }
}
</script>