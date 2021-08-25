<template>
    <div class="p-mobile-main">
        <div class="menu">
            <template v-for="(item, index) in menu">
                <div v-if="hasPermission(item.rule)"
                    class="menu__item"
                    :key="index"
                    @click.stop="linkTo(item)">
                    <div class="menu__item__icon">
                        <img v-if="item.imgFilename"
                            :src="require(`@/assets/images/${item.imgFilename}`)"
                            :alt="hadleI18n(item.label)">
                        <Icon v-else :type="item.icon" />
                    </div>
                    <div class="menu__item__label">
                        {{ hadleI18n(item.label) }}
                    </div>
                </div>
            </template>
        </div>
    </div>
</template>
<script>
import menu from '@/menu/m-parking-mgnt.js'
export default {
    name: 'Main',
    data() {
        return {
            menu: []
        }
    },
    created() {
        this.setMenu()
    },
    methods: {
        setMenu() {
            this.menu = this.deepCopy(menu)
                .map(item => {
                    if (item.rule === 'remaining@mobile@PM')
                        item.imgFilename = 'parking-black.svg'
                    return item
                })
        },
        linkTo(item) {
            if (!item || !item.path)
                return
            this.$router.push({ path: `/m-frontend/${item.path}` })
                .catch(err => { console.error(err) })
            this.menuShow = false
        }
    }
}
</script>