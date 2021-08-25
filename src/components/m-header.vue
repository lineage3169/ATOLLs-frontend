<template>
    <div class="c-mobile-header">
        <div class="title">
            {{ title }}
        </div>
    </div>
</template>
<script>
export default {
    name: 'MobileHeader',
    props: {
        title: {
            type: String,
            default: ''
        }
    }
}
</script>