<template>
    <div>
        <Spin size="large" fix/>
    </div>
</template>

<script>
export default {
    name: 'Logout',
    created() {
        this.$http.get(this.$store.state.backendUrl + '/1/sys/c/auth/logout/')
            .then(response => {
                this.$store.commit('deleteData')
                this.$router.replace('/login')
            }, response => {
                console.error(response.data)
                this.$Message.error('Error code: ' + response.status)
            })
    }
}
</script>