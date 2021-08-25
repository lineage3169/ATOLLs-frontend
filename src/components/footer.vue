<template>
    <div class="l-footer">
        <div class="copyright">
            Copyright © 2018-{{year}} ATOLLs
        </div>
    </div>
</template>

<script>
export default {
    name: 'Footer',
    data() {
        return {
            year: '2019'
        }
    },
    created() {
        const d = new Date()
        this.year = d.getFullYear()
    }
}
</script>