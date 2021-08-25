<template>
<transition name="fade">
        <div v-if="menuShow" class="c-moblie-menu">
            <div class="menu">
                <div class="logo">
                    <div class="logo__img" @click="toMainPage()">
                        <img src="../../assets/images/logo-benz.svg"
                            alt="Benz logo">
                    </div>
                    <div class="logo__title">
                    </div>
                </div>
                <div class="menu__container">
                    <div v-if="hasPermission('mobile@PM')"
                        class="menu__item mb-5" @click="toMainPage()">
                        <div class="menu__item__icon">
                            <Icon type="md-home" />
                        </div>
                        <div class="menu__item__label">
                            {{ $t('BackToHomepage') }}
                        </div>
                    </div>
                    <hr class="mb-10">
                    <template v-for="(item, index) in menuList">
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
                <div class="menu__footer" @click="logout()">
                    <div class="menu__footer__icon">
                        <Icon type="md-return-left" />
                    </div>
                    <div class="menu__footer__title">
                        {{ $t('Logout') }}
                    </div>
                </div>
            </div>
            <div class="block" @click.stop="close()"></div>
        </div>
    </transition>
</template>
<script>
import menu from '@/menu/m-parking-mgnt.js'
export default {
    name: 'MobileMenu',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            menuShow: false,
            menuList: menu
        }
    },
    methods: {
        linkTo(item) {
            if (!item || !item.path)
                return
            this.$router.push({ path: `/m-frontend/${item.path}` })
                .catch(err => { console.error(err) })
            this.menuShow = false
        },
        logout() {
            this.$router.push({ name: 'Logout' })
                .catch(err => { console.error(err) })
        },
        close() {
            this.menuShow = false
        },
        toMainPage() {
            this.$router.push({ path: '/m-frontend/' })
                .catch(err => { console.error(err) })
            this.close()
        }
    },
    watch: {
        value(data) {
            this.menuShow = data
        },
        menuShow(data) {
            this.$emit('input', data)
        }
    }
}
</script>