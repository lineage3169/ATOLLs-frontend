<template>
    <Modal v-model="show">
        <div slot="header" class="fz--large">
            {{`${$t('Add')}${$t('Area')}`}}
        </div>
        <Form ref="form"
            :model="form"
            @submit.native.prevent>
            <!-- 區域名稱 -->
            <FormItem class="form__items"
                :label="$t('Area') + $t('Name')">
               <Input   v-model="form.name"
                        type="text"
                        class="input"
                        :placeholder="$t('PlaceHolder.TypeAreaName')"/>
            </FormItem>
            <!-- 單位 -->
            <FormItem class="form__items"
                :label="$t('Unit')">
                <Select v-model="form.group"
                    filterable
                    :placeholder="$t('PlaceHolder.PleaseChoose')">
                    <Option v-for="item in groupList"
                        :value="item.value"
                        :key="item.value"
                        :label="item.label"/>
                </Select>
            </FormItem>
        </Form>
        <div slot="footer">
            <Button size="large"
                    class="btn btn--outline w-100"
                    :loading="apiLoading"
                    @click.stop="show = false">
                    {{$t('Cancel')}}
            </Button>
            <Button size="large"
                    class="btn w-100"
                    :disabled="!form.name || !form.group"
                    :loading="apiLoading"
                    @click.stop="createArea()">
                    {{$t('Create')}}
            </Button>
        </div>
    </Modal>
</template>

<script>
export default {
    name: 'CreateArea',
    props: {
        value: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            show: false,
            form: {
                name: '',
                group: ''
            },
            groupList: [],
            apiLoading: false
        }
    },
    created() {
        this.getGroups()
    },
    methods: {
        createArea() {
            this.apiLoading = true
            const postObj = {
                pg_name: this.form.name,
                group: this.form.group
            }
            const config = {
                method: 'post',
                path: '/1/pm/c/pg/create/',
                obj: postObj,
                success: () => {
                    const successMsg = this.$t('Create') + this.$t('Success')
                    this.$Message.success(successMsg)
                    this.$emit('refresh')
                    this.resetInput()
                    this.show = false
                },
                error: this.createAreaError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        createAreaError(response) {
            let errMsg = this.$t('Error.CreateArea.General') + '<br>'
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 未提供區域名稱
                    errMsg += this.$t('Error.CreateArea.Code1')
                    break
                case 2:
                    // 未提供群組
                    errMsg += this.$t('Error.CreateArea.Code2')
                    break
                default:
                    // 未預期的錯誤
                    errMsg += this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        getGroups() {
            this.apiLoading = true
            const config = {
                method: 'get',
                path: '/1/sys/c/groups/get/',
                success: response => {
                    if (response.data && response.data.data) {
                        const data = this.deepCopy(response.data.data)
                        this.groupList = data.map(item => {
                            const obj = {
                                value: item.name,
                                label: `${item.alias} (${item.name})`
                            }
                            return obj
                        })
                    }
                },
                error: this.handleError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        handleError(response) {
            let errMsg = this.$t('Error.Groups.GetGeneral') + '<br>'
            if (response.status)
                errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.$Modal.error({
                title: this.$t('ERROR'),
                content: errMsg,
                okText: this.$t('OK')
            })
        },
        resetInput() {
            this.form.name = ''
            this.form.group = ''
        }
    },
    watch: {
        value(data) {
            this.show = data
        },
        show(data) {
            this.$emit('input', data)
        }
    }
}
</script>