<template>
    <div class="form-generate__content">
        <div v-for="(item, index) in elements"
            class="form-generate__items"
            :key="index">
            <div class="form-generate__items__label" >
                {{item.label}}
                <Tooltip v-if="item.help" placement="right">
                    <Icon type="md-help-circle" />
                    <div v-html="item.help" slot="content"></div>
                </Tooltip>
            </div>
            <template v-if="item.type === 'text'">
                <Input v-model="form[item.model]"
                        type="text"
                        clearable
                        :disabled="item.disabled ? true : false"
                        :key="index"
                        :style="`width:${item.width}px;`"
                        :placeholder="item.placeholder"/>
            </template>
            <template v-else-if="item.type === 'textarea'">
                <Input v-model="form[item.model]"
                        type="textarea"
                        clearable
                        :disabled="item.disabled ? true : false"
                        :key="index"
                        :rows="item.rows ? item.rows : 0"
                        :maxlength="item.maxlength ? item.maxlength : 0"
                        :show-word-limit="item.showLimit ? true : false"
                        :style="`width:${item.width}px;`"
                        :placeholder="item.placeholder"/>
            </template>
            <template v-else-if="item.type === 'datepicker'">
                <DatePicker placement="bottom-start"
                            format="yyyy-MM-dd"
                            :disabled="item.disabled ? true : false"
                            :type="item.datepickerType ? item.datepickerType : 'date'"
                            :value="form[item.model]"
                            :placeholder="item.placeholder"
                            :multiple="item.multiple ? true : false"
                            :style="`width:${item.width}px;`"
                            @on-change="date => {
                                if (item.func) item.func(date, item.model)
                            }">
                </DatePicker>
            </template>
            <template v-else-if="item.type === 'select'">
                <Select v-model="form[item.model]"
                        clearable
                        :disabled="item.disabled ? true : false"
                        :style="`width:${item.width}px;`"
                        :placeholder="item.placeholder">
                        {{ item.optionMap }}
                        <template v-if="item.optionMap">
                            <Option v-for="key in Object.keys(item.optionMap)"
                                    :key="key"
                                    :value="key"
                                    :label="item.optionMap[key]"/>
                        </template>
                        <template v-else-if="item.list">
                            <Option v-for="(item, index) in item.list"
                                    :key="index"
                                    :value="item.value"
                                    :label="item.label"/>
                        </template>
                </Select>
            </template>
            <template v-else-if="item.type === 'switch'">
                <i-switch v-model="form[item.model]"
                    :disabled="item.disabled ? true : false"/>
            </template>
            <template v-else-if="item.type === 'file'">
                <Upload action='fake-path'
                        :before-upload="file => {
                            return handleUpload(file,item.fileMaxSize,item.model)}">
                    <Button icon="md-cloud-upload"
                            :style="`width:${item.width}px;`">
                            {{ $t('Select') + $t('File') }}
                    </Button>
                </Upload>
                <span v-if="form[item.model]">
                    <Icon type="md-document" />
                    {{ form[item.model].name }}
                </span>
            </template>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FormItems',
    props: {
        elements: {
            type: Array
        },
        value: {
            type: Object
        }
    },
    data() {
        return {
            form: {}
        }
    },
    mounted() {
        if (this.value)
            this.form = this.deepCopy(this.value)
    },
    methods: {
        handleUpload(file, fileMaxSize, key) {
            const fileSize = parseInt(file.size / 1024)
            if (!isNaN(parseInt(fileMaxSize)) && fileSize > fileMaxSize) {
                this.$Modal.warning({
                    title: this.$t('Notice.UploadExceedFileSizeB'),
                    content: `${this.$t('Notice.UploadExceedFileSizeA')} ${parseInt(fileMaxSize / 1024)} MB`,
                    okText: this.$t('OK')
                })
            }
            else this.form[key] = file
            return false
        }
    },
    watch: {
        value(data) {
            this.form = data
        },
        form: {
            handler: function(newVal) {
                this.$emit('input', newVal)
            },
            deep: true
        }
    }
}
</script>