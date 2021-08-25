<template>
    <div class="p-fac-valuation">
        <div class="content">
            <Spin v-if="initLoading" size="large" fix/>
            <div v-if="currentStatus === 'OUTSOURCING' || currentStatus === 'NOTSET'"
                 class="init">
                <div class="info mb-30">
                    <p v-if="currentStatus === 'NOTSET'">{{$t('Error.NotSetPrice')}}</p>
                    <p v-if="currentStatus === 'OUTSOURCING'">{{$t('Error.NotGetOutsourcing')}}</p>
                </div>
                <Button v-if="currentStatus === 'NOTSET'"
                        class="btn"
                        @click.stop="currentStatus = 'FIRST'">
                    {{$t('SettingNow')}}
                </Button>
            </div>
            <div v-if="currentStatus === 'FIRST' || currentStatus === 'WAIT' || currentStatus === 'DONE'"
                 class="content__main" >
                <div v-if="currentStatus === 'DONE'"
                     class="edit-button" >
                    {{$t('Edit')}}
                    <i-switch v-model="isEdit" class="ml-10"
                              :before-change="handleBeforeChange" />
                </div>
                <div class="content__main__table">
                    <div v-if="currentStatus === 'WAIT'"
                        class="wait-approval-info" >
                        <div class="loader"></div>
                        <span class="ml-10">{{$t('WaitingForApproval')}}</span>
                    </div>
                    <div v-if="currentStatus === 'WAIT'"
                        class="wait-approval-block" ></div>
                    <table cellspacing="0" cellpadding="0">
                        <thead>
                            <tr>
                                <th>{{$t('IDA')}}</th>
                                <th>{{$t('Name')}}</th>
                                <th>{{$t('Unit')}}</th>
                                <th>{{$t('Price')}}</th>
                                <th>{{$t('Weight')}}</th>
                                <th width="250"></th>
                            </tr>
                        </thead>
                        <tbody>
                            <template v-if="valuationData.length > 0">
                                <tr v-for="(item,index) in valuationData"
                                    :class="{'is-even-row':isEvenRow(index),
                                             'is-deleted':item.deleted}"
                                    :key="index">
                                    <template v-if="item.deleted">
                                        <td colspan="6">
                                            <div class="delete-row">
                                                <div class="title">{{`- ${$t('Deleted')}`}}</div>
                                                <div class="redo-button" @click.stop="item.deleted = false">
                                                    <Icon type="md-refresh" />
                                                    {{$t('Recover')}}
                                                </div>
                                            </div>
                                        </td>
                                    </template>
                                    <template v-else>
                                        <td :class="{'is-changed':item.changed}">
                                            <div v-if="item.edit" class="contrast">{{contrastData[index].id}}</div>
                                            <i-input v-model="item.id"
                                                    :class="{'is-repeated':isRepeatID(item.id),
                                                            'is-read-mode':isReadMode(item)}"
                                                    :clearable="!isReadMode(item)"
                                                    :placeholder="$t('PlaceHolder.IdCantRepeat')"
                                                    :readonly="isReadMode(item)"
                                                    @on-change="isRepeatID(item.id)"/>
                                        </td>
                                        <td>
                                            <div v-if="item.edit" class="contrast">{{contrastData[index].name}}</div>
                                            <i-input v-model="item.name"
                                                    :class="{'is-read-mode':isReadMode(item)}"
                                                    :clearable="!isReadMode(item)"
                                                    :readonly="isReadMode(item)"
                                                    :placeholder="$t('PlaceHolder.InputItemName')"/>
                                        </td>
                                        <td>
                                            <div v-if="item.edit" class="contrast">{{contrastData[index].unit}}</div>
                                            <AutoComplete v-model="item.unit"
                                                        clearable
                                                        :class="{'is-read-mode':isReadMode(item)}"
                                                        :data="unitList"
                                                        :disabled="isReadMode(item)"
                                                        :placeholder="$t('PlaceHolder.SelectOrCustomUnit')">
                                            </AutoComplete>
                                        </td>
                                        <td>
                                            <div v-if="item.edit" class="contrast">{{contrastData[index].price}}</div>
                                            <InputNumber v-model="item.price"
                                                        editable
                                                        :class="{'is-read-mode':isReadMode(item)}"
                                                        :step="0.1"
                                                        :readonly="isReadMode(item)"
                                                        :placeholder="$t('PlaceHolder.PerUnitNTD')" />
                                        </td>
                                        <td>
                                            <div v-if="item.edit" class="contrast">{{contrastData[index].weight}}</div>
                                            <InputNumber v-model="item.weight"
                                                        editable
                                                        :class="{'is-read-mode':isReadMode(item)}"
                                                        :step="0.1"
                                                        :readonly="isReadMode(item)"
                                                        :placeholder="$t('PlaceHolder.PerUnitG')" />
                                        </td>
                                        <td v-if="currentStatus === 'FIRST'" class="action">
                                            <Button class="action__button action__button--delete"
                                                    @click.stop="deleteRow(index,'valuationData')">
                                                <Icon type="md-trash" />
                                            </Button>
                                        </td>
                                        <td class="action" v-if="!item.edit">
                                            <Button v-show="isEdit && currentStatus === 'DONE'"
                                                    class="action__button action__button--edit mr-15"
                                                    @click.stop="editRow(item)">
                                                <Icon type="md-create" />
                                            </Button>
                                            <Button v-show="isEdit && currentStatus === 'DONE'"
                                                    class="action__button action__button--delete"
                                                    @click.stop="deleteRow(index,'valuationData')">
                                                <Icon type="md-trash" />
                                            </Button>
                                        </td>
                                        <td v-if="item.edit">
                                            <div class="edit-tool">
                                                <div class="edit-tool__item mr-5"
                                                    :title="$t('Reset')"
                                                    @click.stop="resetRowData(index)">
                                                    <Icon type="md-undo" />
                                                </div>
                                                <div class="edit-tool__item"
                                                    :title="$t('Cancel')"
                                                    @click.stop="cancelEdit(index)">
                                                    <Icon type="md-close" />
                                                </div>
                                            </div>
                                        </td>
                                    </template>
                                </tr>
                            </template>
                            <template v-if="newData.length > 0">
                                <tr v-for="(item,index) in newData"
                                    :key="'new-data' + index">
                                    <td :class="{'is-new-row':item.isNewRow}">
                                        <i-input v-model="item.id"
                                                :class="{'is-repeated':isRepeatID(item.id)}"
                                                :placeholder="$t('PlaceHolder.IdCantRepeat')"
                                                @on-change="isRepeatID(item.id)"/>
                                    </td>
                                    <td>
                                        <i-input v-model="item.name"
                                                :placeholder="$t('PlaceHolder.InputItemName')"/>
                                    </td>
                                    <td>
                                        <AutoComplete v-model="item.unit"
                                                    clearable
                                                    :data="unitList"
                                                    :placeholder="$t('PlaceHolder.SelectOrCustomUnit')">
                                        </AutoComplete>
                                    </td>
                                    <td>
                                        <InputNumber v-model="item.price"
                                                    editable
                                                    :step="0.1"
                                                    :placeholder="$t('PlaceHolder.PerUnitNTD')" />
                                    </td>
                                    <td>
                                        <InputNumber v-model="item.weight"
                                                    editable
                                                    :step="0.1"
                                                    :placeholder="$t('PlaceHolder.PerUnitG')" />
                                    </td>
                                    <td class="action">
                                        <Button class="action__button action__button--delete"
                                                @click.stop="deleteRow(index,'newData')">
                                            <Icon type="md-trash" />
                                        </Button>
                                    </td>
                                </tr>
                            </template>
                            <tr v-if="showAddBtn()">
                                <td colspan="6">
                                    <Button class="add"
                                            :disabled="disableAdd()"
                                            @click.stop="addRow()">
                                        <Icon type="md-add" />
                                    </Button>
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
                <div class="content__main__status">
                    {{approvalTime}}
                </div>
                <div class="content__main__btn-container">
                    <Button v-if="currentStatus === 'WAIT'"
                            class="btn btn--outline w-150 mr-10"
                            @click.stop="cancel()">
                            {{$t("Cancel")}}
                    </Button>
                    <Button v-if="showSubmitBtn()"
                            class="btn w-150"
                            :disabled="disableSubmit()"
                            :loading="apiLoading"
                            @click.stop="submit()">
                            {{$t("Submit")}}
                    </Button>
                </div>
            </div>
        </div>
    </div>
</template>
<script>
export default {
    name: 'FactoryValuation',
    data() {
        return {
            // NOTE:
            // 未取得委外廠商 OUTSOURCING,  未設定 NOTSET
            // 初次設定 FIRST, 待核准 WAIT, 已核准 DONE
            currentStatus: 'OUTSOURCING',
            initShow: true,
            unitList: ['張', '封', '面', '本'],
            valuationData: [],
            newData: [],
            contrastData: [],
            isEdit: false,
            approvalTime: '',
            initLoading: false,
            apiLoading: false
        }
    },
    created() {
        this.getData()
    },
    methods: {
        getData() {
            this.initLoading = true
            this.approvalTime = ''
            this.newData = []
            const { outsourcing: ID = '' } = this.$store.state.profile || {}
            if (!ID) {
                this.currentStatus = 'OUTSOURCING'
                this.initLoading = false
                return
            }
            const config = {
                path: `/1/ins/c/outsourcing/paw/${ID}/get/`,
                method: 'post',
                success: this.getDataSuccess,
                error: this.getDataError,
                final: () => { this.initLoading = false }
            }
            this.ajax(config)
        },
        getDataSuccess(response) {
            if (!response.data || !response.data.data)
                return
            const [data] = response.data.data
            if (!data) {
                this.addRow()
                this.currentStatus = 'NOTSET'
                return
            }
            const isPawEmpty = !data.paw || Object.keys(data.paw).length === 0
            const isPendingPawEmpty = Object.keys(data.pending_paw).length === 0
            if (isPawEmpty && isPendingPawEmpty) {
                this.addRow()
                this.currentStatus = 'NOTSET'
                return
            }
            let approvalTime = null
            let updateTime = null
            if (this.isDate(data.approval_time))
                approvalTime = new Date(data.approval_time)
            if (this.isDate(data.update_time))
                updateTime = new Date(data.update_time)
            let dataKey = ''
            if (updateTime > approvalTime) {
                this.currentStatus = 'WAIT'
                dataKey = 'pending_paw'
            }
            else {
                this.approvalTime = approvalTime.toLocaleString() + ` ${this.$t('Approved')}`
                this.currentStatus = 'DONE'
                dataKey = 'paw'
            }
            if (Object.keys(data[dataKey]).length > 0) {
                this.initShow = false
                this.valuationData = this.transToArray(data[dataKey])
                this.contrastData = this.transToArray(data[dataKey])
            }
        },
        getDataError(response) {
            let errMsg = this.$t('Error.Valuation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        submit() {
            this.apiLoading = true
            const { outsourcing: id = '' } = this.$store.state.profile || {}
            const postObj = {
                outsourcing_id: id,
                paw: this.getSubmitData()
            }
            const config = {
                path: '/1/ins/c/outsourcing/paw/update/',
                method: 'post',
                obj: postObj,
                success: () => { this.getData() },
                error: this.submitError,
                final: () => { this.apiLoading = false }
            }
            this.ajax(config)
        },
        submitError(response) {
            let errMsg = this.$t('Error.Valuation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        cancel() {
            this.currentStatus = 'FIRST'
        },
        addRow() {
            const rowObj = {
                id: '',
                name: '',
                unit: '',
                price: null,
                weight: null,
                edit: false,
                changed: false,
                deleted: false,
                isNewRow: false
            }
            if (this.currentStatus === 'DONE') rowObj.isNewRow = true
            this.newData.push(rowObj)
        },
        deleteRow(index, key) {
            if (this.isEdit && key === 'valuationData' && this.currentStatus === 'DONE') {
                this[key][index].deleted = true
                return
            }
            if (this[key].length > 1)
                this[key].splice(parseInt(index), 1)
            else {
                this[key] = [{
                    id: '',
                    name: '',
                    unit: '',
                    price: null,
                    weight: null,
                    edit: false,
                    changed: false,
                    deleted: false,
                    isNewRow: false
                }]
            }
        },
        editRow(item) {
            item.edit = true
        },
        disableAdd() {
            if (this.newData && this.newData.length > 0) {
                const lastIndex = this.newData.length - 1
                if (!this.newData[lastIndex].id)
                    return true
            }
            return false
        },
        isEvenRow(index) {
            if (this.valuationData && parseInt(index) % 2 === 1)
                return true
            return false
        },
        isRepeatID(data) {
            const allID = [...this.valuationData, ...this.newData]
            const sameId = allID.map(item => item.id.toUpperCase())
                .filter(item => item === data.toUpperCase())
            if (sameId.length > 1)
                return true
            return false
        },
        isEmpty(data) {
            if (!data)
                return true
            return false
        },
        checkAllID() {
            let isRepeat = false
            this.valuationData.forEach(item => {
                if (this.isRepeatID(item.id))
                    isRepeat = true
            })
            return isRepeat
        },
        checkAllData() {
            let hasEmpty = false
            let allValue = []
            const lastIndex = this.valuationData.length - 1
            const valuationData = this.deepCopy(this.valuationData)
            const newData = this.deepCopy(this.newData)
            newData.pop()
            const data = [...newData, ...valuationData]
            data.forEach((item, index) => {
                if (index !== lastIndex)
                    allValue = [...allValue, ...Object.values(item).slice(0, 5)]
            })
            for (let i = 0; i < allValue.length; i++) {
                if (this.isEmpty(allValue[i]))
                    hasEmpty = true
            }

            return hasEmpty
        },
        checkLastRow() {
            const data = [...this.valuationData, ...this.newData]
            if (!data || data.length === 0)
                return false
            const lastIndex = data.length - 1
            let isAllEmpty = true
            let hasEmpty = false
            const lastRow = Object.values(data[lastIndex]).slice(0, 5)
            for (let i = 0; i < lastRow.length; i++)
                this.isEmpty(lastRow[i]) ? hasEmpty = true : isAllEmpty = false

            if (hasEmpty === false) return false
            if (isAllEmpty && data.length > 1) return false
            return true
        },
        disableSubmit() {
            if (this.checkAllData())
                return true
            if (this.checkAllID())
                return true
            if (this.checkLastRow())
                return true
            return false
        },
        getSubmitData() {
            const obj = {}
            const _this = this
            function setData(key) {
                if (!key) return
                _this[key].forEach(item => {
                    if (item.id && item.deleted === false) {
                        obj[item.id] = {
                            name: item.name,
                            unit: item.unit,
                            price: item.price,
                            weight: item.weight
                        }
                    }
                })
            }
            setData('valuationData')
            setData('newData')
            return JSON.stringify(obj)
        },
        transToArray(data) {
            const arr = []
            Object.keys(data).forEach(key => {
                const obj = {
                    id: key,
                    name: data[key].name,
                    unit: data[key].unit,
                    price: data[key].price,
                    weight: data[key].weight,
                    edit: false,
                    changed: false,
                    deleted: false,
                    isNewRow: false
                }
                arr.push(obj)
            })
            return arr
        },
        showSubmitBtn() {
            if (this.currentStatus === 'WAIT')
                return false
            if (this.currentStatus === 'DONE' && !this.isEdit)
                return false
            return true
        },
        showAddBtn() {
            if (this.currentStatus === 'WAIT')
                return false
            if (this.currentStatus === 'DONE' && !this.isEdit)
                return false
            return true
        },
        isReadMode(item) {
            if (this.currentStatus === 'FIRST')
                return false
            if (this.currentStatus === 'DONE' && item && item.edit)
                return false
            return true
        },
        handleValueChanged(originData) {
            const data = this.deepCopy(originData)
            data.forEach((item, index) => {
                const contrast = this.contrastData[index]
                const valuesData = Object.values(item)
                    .slice(0, 5)
                    .join(',')
                const contrastData = Object.values(contrast)
                    .slice(0, 5)
                    .join(',')
                if (valuesData !== contrastData)
                    this.valuationData[index].changed = true
                else this.valuationData[index].changed = false
            })
        },
        resetRowData(index) {
            const contrast = this.contrastData[index]
            const resetKeys = ['id', 'name', 'unit', 'price', 'weight']
            resetKeys.forEach(key => {
                this.valuationData[index][key] = contrast[key]
            })
        },
        cancelEdit(index) {
            this.resetRowData(index)
            this.valuationData[index].edit = false
        },
        handleBeforeChange() {
            const isEdit = this.isEdit
            const data = [...this.valuationData, ...this.newData]
            const isChanged = data.map(item => item.changed).some(item => item)
            const hasNewRows = data.map(item => item.isNewRow).some(item => item)
            const hasDelete = data.map(item => item.deleted).some(item => item)
            if (isEdit) {
                if (isChanged || hasNewRows || hasDelete) {
                    return new Promise((resolve) => {
                        this.$Modal.confirm({
                            title: this.$t('WARNING'),
                            content: this.$t('DetectMsg'),
                            okText: this.$t('OK'),
                            cancelText: this.$t('Cancel'),
                            onOk: () => {
                                this.valuationData = this.contrastData
                                this.newData = []
                                resolve()
                            }
                        })
                    })
                }
            }
        }
    },
    watch: {
        valuationData: {
            handler: function(data) {
                if (this.currentStatus === 'DONE')
                    this.handleValueChanged(data)
            },
            deep: true
        },
        isEdit(data) {
            if (data === false) {
                this.valuationData.forEach(item => {
                    item.edit = false
                    item.deleted = false
                })
            }
        }
    }
}
</script>