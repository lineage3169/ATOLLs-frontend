<template>
    <div class="c-permission-block" @click.stop="">
        <div class="c-permission-block__msg" v-html="msg"></div>
    </div>
</template>
<script>
export default {
    name: 'PermissionBlock',
    props: {
        msg: {
            type: String,
            default: ''
        }
    }
}
</script>