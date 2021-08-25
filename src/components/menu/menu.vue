<template>
    <div class="c-menu noselect"
        :class="{'menu--collect' : menuCollect }">
        <div class="menu__logo">
            <img v-if="isParkingMgnt"
                class="menu__logo__icon"
                src="../../assets/images/logo-benz.svg"
                alt="Benz logo">
            <img v-else class="menu__logo__icon"
                src="../../assets/images/logo.png"
                alt="ATOLLs logo">
        </div>
        <div class="module"
            :class="{
                'module--parking-mgnt' : moduleType === 'PM',
                'module--insurance' : moduleType === 'INS',
                'module--operation' : moduleType === 'OPE',
                'module--none' : moduleTypeList.length <= 1
            }">
            <template v-if="moduleTypeList.length > 1">
                <Select v-model="moduleType"
                    @on-change="handleModuleType(moduleType)">
                    <Option v-for="item in moduleTypeList"
                        :value="item.value"
                        :label="item.label"
                        :key="item.value"/>
                </Select>
            </template>
        </div>
        <!-- Menu -->
        <Scrollbar class="c-menu__content" :settings="scrollbarConfig">
            <ul>
                <li v-for="(item, index) in menu" :key="index">
                    <template v-if="hasPermission(item.rule) && !item.type">
                        <!-- Item has sub menu -->
                        <div v-if="item.sub && item.sub.length > 0"
                            :class="{
                                'c-menu__items--active' : item.isActive,
                                'c-menu__items--collect' : item.isCollect
                            }">
                            <div class="c-menu__items"
                                :id="`menu-item-${index}`"
                                @mouseover.stop="handleMouseOver(index)"
                                @click.stop="handleCollect(index)">
                                <div v-show="menuCollect"
                                    class="c-menu__items__side-info"
                                    :id="`side-info-${index}`">
                                    {{ hadleI18n(item.label) }}
                                </div>
                                <div class="c-menu__items__icons">
                                    <img v-if="item.imgFilename"
                                        :src="require(`@/assets/images/${item.imgFilename}`)"
                                        :alt="hadleI18n(item.label)">
                                    <Icon v-else :type="item.icon" />
                                </div>
                                <div class="c-menu__items__title">
                                    {{ hadleI18n(item.label) }}
                                </div>
                                <div class="menu__items__arrow">
                                    <Icon type="ios-arrow-down" />
                                </div>
                            </div>
                            <div v-for="(sub, key) in item.sub"
                                v-show="item.isCollect"
                                class="c-menu__items__sub"
                                :key="key"
                                @click.stop="handleLink(sub, index)">
                                <div class="c-menu__items__sub__label">
                                    {{ hadleI18n(sub.label) }}
                                </div>
                            </div>
                        </div>
                        <!-- normal menu -->
                        <div v-else
                            :class="{ 'c-menu__items--active' : item.isActive }">
                            <div class="c-menu__items"
                                :id="`menu-item-${index}`"
                                @mouseover.stop="handleMouseOver(index)"
                                @click.stop="handleLink(item, index)">
                                <div v-show="menuCollect"
                                    :id="`side-info-${index}`"
                                    class="c-menu__items__side-info">
                                    {{ hadleI18n(item.label) }}
                                </div>
                                <div class="c-menu__items__icons">
                                    <img v-if="item.imgFilename"
                                        :src="require(`@/assets/images/${item.imgFilename}`)"
                                        :alt="hadleI18n(item.label)">
                                    <Icon v-else :type="item.icon" />
                                </div>
                                <div class="c-menu__items__title">
                                    {{ hadleI18n(item.label) }}
                                </div>
                                <div class="c-menu__items__arrow"></div>
                            </div>
                        </div>
                    </template>
                </li>
            </ul>
        </Scrollbar>
        <!-- Account menu -->
        <template v-for="(item,index) in menu">
            <div v-if="item.type === 'ACCOUNT'"
                :class="{ 'c-menu__items--active' : item.isActive }"
                :key="index">
                <div class="c-menu__items"
                    :id="`menu-item-${index}`"
                    @mouseover.stop="handleMouseOver(index)"
                    @click.stop="handleLink(item, index)">
                    <div v-show="menuCollect"
                        :id="`side-info-${index}`"
                        class="c-menu__items__side-info">
                        {{ hadleI18n(item.label) }}
                    </div>
                    <div class="c-menu__items__icons">
                        <Icon :type="item.icon" />
                    </div>
                    <div class="c-menu__items__title">
                        {{ hadleI18n(item.label) }}
                    </div>
                    <div class="c-menu__items__arrow"></div>
                </div>
            </div>
        </template>
        <div class="c-menu__footer">
            <div class="c-menu__collect__btn"
                @click.stop="menuCollect = !menuCollect">
                <div class="c-menu__collect__btn__icon">
                    <Icon v-if="!menuCollect" type="ios-arrow-back"/>
                    <Icon v-if="menuCollect" type="ios-arrow-forward"/>
                </div>
                <div v-show="!menuCollect" class="c-menu__collect__btn__title">
                    {{ $t('CollapseSidebar') }}
                </div>
            </div>
        </div>
        <PermissionBlock v-if="!isPermission" :msg="msg"/>
    </div>
</template>
<script>
import Scrollbar from 'vue-perfect-scrollbar'
import PermissionBlock from '@/components/permission-block.vue'
import sysMenu from '@/menu/system.js'
export default {
    name: 'DestopMenu',
    components: { Scrollbar, PermissionBlock },
    data() {
        return {
            scrollbarConfig: {
                suppressScrollX: false,
                maxScrollbarLength: 100
            },
            menu: [],
            moduleType: '',
            moduleTypeList: this.$store.state.moduleTypeList,
            menuCollect: false,
            isPermission: true,
            msg: '未取得任何權限<br>將於 5 秒後登出'
        }
    },
    created() {
        this.menuInit()
    },
    methods: {
        menuInit() {
            if (this.moduleTypeList.length === 0) {
                // 只有系統模組
                if (this.hasPermission('SYS'))
                    this.menu = this.deepCopy(sysMenu)
                else this.logout()
                return
            }
            const current = this.$router.history.current
            let moduleType = this.moduleTypeList[0].value
            // 重整後根據 path 復原 Menu 狀態
            if (current.path !== '/frontend' && current.meta.moduleType)
                moduleType = current.meta.moduleType
            this.moduleType = moduleType
            this.menu = this.deepCopy(this.$store.state.menu[moduleType])
            const index = this.menu
                .findIndex(item => item.path === current.fullPath)
            if (index > -1) this.handleActive(index)
        },
        handleCollect(index) {
            if (this.menuCollect) {
                const [item] = this.menu[index].sub
                this.handleLink(item, index)
            }
            else {
                this.menu = this.menu.map((item, i) => {
                    if (index === i) item.isCollect = !item.isCollect
                    return item
                })
            }
        },
        handleActive(index) {
            this.menu = this.menu.map((item, i) => {
                if (index === i) item.isActive = true
                else item.isActive = false
                return item
            })
        },
        handleLink(item, index) {
            this.handleActive(index)
            this.$router.push({ path: item.path })
                .catch(err => { console.error(err) })
        },
        handleModuleType(type) {
            this.menu = this.deepCopy(this.$store.state.menu[type])
        },
        handleMouseOver(index) {
            // handle scroll hover menu
            const sideInfo = document.querySelector(`#side-info-${index}`)
            const menuItem = document.querySelector(`#menu-item-${index}`)
            const top = menuItem.getBoundingClientRect().top || 0
            if (sideInfo) sideInfo.style.top = `${top}px`
        },
        logout() {
            this.isPermission = false
            let countdown = 4
            const interval = setInterval(() => {
                this.msg = '未取得任何權限<br>'
                this.msg += '將於 ' + countdown + ' 秒後登出'
                if (countdown > 0) countdown--
                else {
                    clearInterval(interval)
                    this.$router.push({ name: 'Logout' })
                        .catch(err => { console.error(err) })
                }
            }, 1000)
        }
    },
    watch: {
        menuCollect(data) {
            if (!data) return
            this.menu = this.menu.map(item => {
                item.isCollect = false
                return item
            })
        }
    },
    computed: {
        isParkingMgnt() {
            return this.$store.state.moduleType === 'PM'
        }
    }
}
</script>