<template>
    <div class="p-factory">
        <audio ref="audio">
            <source :src="require('@/assets/sound/error.mp3')" type="audio/mpeg">
        </audio>
        <div class="l-view d-flex">
            <!-- 表單 -->
            <div class="formArea">
                <Spin v-if="apiLoading" ref="spin" fix size="large"/>
                <Form ref="form" :model="form" :rules="rule" :label-position="'top'" @submit.native.prevent>
                    <!-- 工單編號 -->
                    <FormItem prop="orderID" :label="$t('OrderID')">
                        <Input v-model="form.orderID" :placeholder="$t('PlaceHolder.InputOrderID')"/>
                    </FormItem>
                    <!-- 進度 -->
                    <FormItem prop="step" :label="$t('Progress')">
                        <Select v-model="form.step"
                                :placeholder="$t('PlaceHolder.ChooseProgressLock')"
                                :disabled="stepDisable || !form.orderID"
                                @on-change="handleStepChange();getSequence()">
                            <Option v-for="(s, index) in steps" :key="index" :value="s" :label="stepsMap[s]">
                                <span>{{ stepsMap[s] }}</span>
                            </Option>
                        </Select>
                    </FormItem>
                    <!-- 單位 -->
                    <FormItem prop="target" :label="$t('Unit')">
                        <RadioGroup v-model="form.target" @on-change="handleTargetChange" type="button">
                            <Radio class="radiobox__unit" label="single">{{ $t('SingleA') }}</Radio>
                            <Radio v-if="form.step != 'CK' && form.step != 'PA'" class="radiobox__unit" label="batch">{{ $t('Batch') }}</Radio>
                        </RadioGroup>
                    </FormItem>
                    <!-- 變更狀態 -->
                    <template v-if="form.step == 'PO' || form.step == 'CK'">
                        <FormItem :label="$t('Change') + $t('Status')" class="mb-10">
                            <i-switch v-model="allowChangeStatus"
                                    true-color="#0D8EA8"
                                    :disabled="!PRShow"/>
                        </FormItem>
                        <template v-if="allowChangeStatus && PRShow">
                            <FormItem prop="status">
                                <RadioGroup v-model="form.status" type="button" @on-change="handleStatusChange">
                                    <Radio class="radiobox__status" label="N">{{ $t('NormalB') }}</Radio>
                                    <Radio v-if="form.step == 'PO'" class="radiobox__status" label="P">{{ $t('PickOutA') }}</Radio>
                                    <Radio class="radiobox__status" label="CR">{{ $t('RejectA') }}</Radio>
                                </RadioGroup>
                            </FormItem>
                        </template>
                        <FormItem v-if="remarksShow" prop="remarks">
                            <Input v-model="form.remarks" type="textarea" :placeholder="$t('PlaceHolder.Remarks')"/>
                        </FormItem>
                    </template>
                    <!-- 序列開關 -->
                    <FormItem :label="$t('Sequence')" class="mb-10">
                        <i-switch v-model="allowSequence"
                                true-color="#0D8EA8"
                                :disabled="!PRShow || !form.orderID || !form.step"/>
                    </FormItem>
                    <!-- 實體條碼輸入 -->
                    <FormItem prop="orderID" :label="$t('Barcode')">
                        <i-input v-model="inputBarcode"
                                clearable
                                ref="BarcodeInput"
                                placeholder="FBB202016000000"
                                :disabled="!form.orderID"
                                @on-enter="ConfirmEnterBarcode()" >
                        </i-input>
                    </FormItem>
                </Form>
            </div>
            <!-- 序列 -->
            <div class="sequenceArea" :class="{'sequenceArea--disable':!allowSequence}">
                <Spin v-if="sequenceLoading && allowSequence" fix size="large"/>
                <div v-show="!allowSequence" class="title">{{`${$t('SequenceIsNotActivated')}`}}</div>
                <template v-if="allowSequence">
                    <!-- 資訊 -->
                    <div class="info">
                        <!-- 數量統計 -->
                        <div class="tb">
                            <table cellspacing="0" cellpadding="0">
                                <tbody>
                                    <tr>
                                        <!-- 總計 -->
                                        <th>{{$t('TotalB')}}</th>
                                        <!-- 應放行 -->
                                        <th v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--success info--success">{{$t('ReleaseB')}}</th>
                                        <!-- 應驗退 -->
                                        <th v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--error info--error">{{$t('RejectB')}}</th>
                                        <!-- 應抽件 -->
                                        <th v-if="form.step === 'PO'"
                                            class="bg-color--info info--info">{{$t('PickoutB')}}</th>
                                        <!-- 自行驗退 -->
                                        <th v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--error info--error">{{$t('SelfReject')}}</th>
                                    </tr>
                                    <tr>
                                        <td>{{`${userCounts.total} / ${orderCountsTotal}`}}</td>
                                        <td v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--success">
                                            {{`${userCounts.changeNormal} / ${changeCounts.normal}`}}
                                        </td>
                                        <td v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--error">
                                            {{`${userCounts.changeReject} / ${changeCounts.reject}`}}
                                        </td>
                                        <td v-if="form.step === 'PO'"
                                            class="bg-color--info">
                                            {{`${userCounts.changePickout} / ${changeCounts.pickout}`}}
                                        </td>
                                        <td v-if="form.step === 'CK' || form.step === 'PO'"
                                            class="bg-color--error">
                                            {{`${userReject}`}}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                        <div class="filter noselect">
                            <!-- 未指定變更提示 -->
                            <div class="warning-msg" v-show="conflictCount > 0">
                                <Tooltip placement="left"
                                         max-width="200"
                                         :content="$t('Tooltips.ConflictHelp')" >
                                    <div class="icon mr-2 ml-2">
                                        <Icon type="md-help-circle" />
                                    </div>
                                </Tooltip>
                                <div class="warning-msg__content">{{$t('ConflictCount',{count:conflictCount})}}</div>
                            </div>
                            <!-- 資料過濾條件 -->
                            <Select v-model="dataFilterStatus"
                                    :placement="'bottom-end'"
                                    :placeholder="$t('PlaceHolder.SelectFilter')">
                                <Option v-for="item in filterList"
                                        :value="item.value"
                                        :key="item.value">
                                        {{ item.label }}
                                </Option>
                            </Select>
                        </div>
                    </div>
                    <!-- 保單 -->
                    <ul class="list">
                        <div v-if="sequenceArr.length === 0" class="error-msg">
                            {{$t('NoData')}}
                        </div>
                        <li  v-for="(item, index) in sequenceArr"
                            class="list__item"
                            :key="index">
                            <div class="list__item__status"
                                :class="{'list--info-bg':item.status === 'P',
                                        'list--error-bg':item.status === 'CR',
                                        'list--success-bg':item.status === 'N'}" />
                            <div class="list__item__title"
                                :class="{'list--error-bg':item.userSetStatus === 'CR',
                                        'list--success-bg':item.userSetStatus === 'N',
                                        'list--info-bg':item.userSetStatus === 'P',
                                        'list--info-bd':item.changeStatus === 'P',
                                        'list--error-bd':item.changeStatus === 'CR',
                                        'list--success-bd':item.changeStatus === 'N'}">
                                {{item.barcode}}
                            </div>
                        </li>
                    </ul>
                    <div class="btnContainer">
                        <Button class="btn w-150"
                                :disabled="disableSubmit()"
                                @click="confirmSubmit()">
                                {{$t('Submit')}}
                        </Button>
                    </div>
                </template>
            </div>
            <!-- 訊息通知 -->
            <div class="messageArea" :class="{'messageArea--disable':!hasNotice}">
                <div v-show="!hasNotice" class="title">{{$t('NoNotificationYet')}}</div>
                <transition-group name="moveLeft">
                    <template v-for="item in errorNoticeArr">
                        <Tooltip placement="left"
                                max-width="200"
                                :content="item.msg"
                                :key="'notice'+item.key">
                            <div class="notice">
                                <div class="notice__icon">
                                    <Icon type="md-close-circle txt-color--error"/>
                                </div>
                                <div class="notice__title" >{{item.title}}</div>
                            </div>
                        </Tooltip>
                    </template>
                    <div v-for="item in noticeArr"
                        class="notice"
                        :key="'notice'+item.key">
                        <div class="notice__icon">
                            <Icon type="md-checkmark-circle txt-color--success" />
                        </div>
                        <div class="notice__title" >{{item.title}}</div>
                    </div>
                </transition-group>
            </div>
        </div>
    </div>
</template>

<script>
import filterList from './filter'
export default {
    name: 'InspProgressUpdate',
    data() {
        const requireCheck = (rule, value, callback) => {
            if (value === '') callback(new Error(this.$t('Unfilled')))
            else callback()
        }
        return {
            form: {
                orderID: '',
                step: '',
                target: 'single',
                status: '',
                remarks: ''
            },
            rule: {
                orderID: [
                    { validator: requireCheck, trigger: 'blur' }
                ],
                step: [
                    { validator: requireCheck, trigger: 'blur' }
                ],
                target: [
                    { validator: requireCheck, trigger: 'blur' }
                ]
            },
            steps: [
                'RC',
                'CO',
                'PR',
                'BD',
                'CK',
                'PA',
                'PO'
            ],
            stepsMap: this.$store.state.progressNameMap,
            targetMap: {
                single: this.$t('SingleA'),
                batch: this.$t('Batch')
            },
            statusMap: this.$store.state.statusNameMap,
            userCounts: {
                normal: 0,
                reject: 0,
                pickout: 0,
                changeNormal: 0,
                changeReject: 0,
                changePickout: 0,
                total: 0
            },
            changeCounts: {
                normal: 0,
                reject: 0,
                pickout: 0,
                total: 0
            },
            orderCountsTotal: 0,
            inputBarcode: '',
            noticeArr: [],
            errorNoticeArr: [],
            sequenceArr: [], // display arr
            sequenceArrPool: [], // origin arr
            userSequenceArr: [], // user scan
            noticeTimer: null,
            hasNotice: false,
            stepDisable: false,
            allowChangeStatus: false,
            allowSequence: false,
            dataFilterStatus: '',
            filterList: filterList(this),
            // modal, drawer show
            PRShow: true,
            remarksShow: false,
            // api loading
            apiLoading: false,
            sequenceLoading: false
        }
    },
    methods: {
        getSequence() {
            this.resetData()
            const proflie = this.$store.state.profile
            if (!this.form.orderID) return
            if (!this.form.step) return
            if (!proflie || !proflie.outsourcing) {
                this.$Message.error(this.$t('Error.NotGetOutsourcing'))
                return
            }
            const outsoursingID = proflie.outsourcing
            this.sequenceLoading = true
            const path = '/1/ins/c/data/progress/exclude/'
            const postObj = {
                outsourcing_id: outsoursingID,
                order_id: this.form.orderID,
                progress: this.form.step
            }
            const config = {
                method: 'post',
                path: path,
                obj: postObj,
                success: response => {
                    if (response && response.data.data)
                        this.setData(response.data.data)
                    this.orderCountsTotal = this.sequenceArrPool.length
                },
                error: this.getSequenceError,
                final: () => { this.sequenceLoading = false }
            }
            this.ajax(config)
        },
        getSequenceError(response) {
            var errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 沒有提供工單編號
                    errMsg = this.$t('Error.GetSequence.Code1')
                    break
                case 2:
                    // 沒有提供排除進度
                    errMsg = this.$t('Error.GetSequence.Code2')
                    break
                case 3:
                    // 沒有提供委外編號
                    errMsg = this.$t('Error.GetSequence.Code3')
                    break
                default:
                    // 未預期的錯誤
                    errMsg = this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        getOperation() {
            const profile = this.$store.state.profile
            if (!profile || !profile.outsourcing) {
                this.$Message.error(this.$t('Error.NotGetOutsourcing'))
                return
            }
            const path = '/1/ins/c/operation/get/'
            const config = {
                method: 'post',
                path: path,
                obj: { outsourcing_id: this.$store.state.outsourcing_id },
                success: response => {
                    if (response && response.data.data)
                        this.setOperation(response.data.data)
                },
                error: this.getOperationsError
            }
            return this.ajax(config)
        },
        getOperationsError(response) {
            var errMsg = this.$t('Error.Operation.GetGeneral') + '<br>'
            if (response.status) errMsg += this.unexpectedErrMsg(response)
            console.error(response)
            this.errorModal(errMsg)
        },
        async setData(input) {
            const data = this.deepCopy(input)
            this.sequenceArrPool = data.map(item => {
                item.userSetStatus = 'none'
                item.changeStatus = ''
                return item
            })

            if (this.form.step === 'CK' || this.form.step === 'PO')
                await this.getOperation()
            this.setChangeCounts()
            this.filterSequence('all')
        },
        setOperation(data) {
            if (!data || data.length === 0) return
            const operationIdArr = data.map(item => item.obj_id)
            this.sequenceArrPool = this.sequenceArrPool
                .map(item => {
                    const index = operationIdArr.indexOf(item.id)
                    if (index > -1) {
                        if (this.form.step === 'CK' && data[index].status === 'P')
                            item.changeStatus = '' // 已檢查不得抽件
                        else item.changeStatus = data[index].status
                    }
                    return item
                })
        },
        setChangeCounts() {
            this.changeCounts.normal = this.sequenceArrPool
                .filter(item => item.changeStatus === 'N')
                .length
            this.changeCounts.pickout = this.sequenceArrPool
                .filter(item => item.changeStatus === 'P')
                .length
            this.changeCounts.reject = this.sequenceArrPool
                .filter(item => item.changeStatus === 'CR')
                .length
        },
        setUserCounts() {
            const normalArr = this.userSequenceArr
                .filter(item => item.status === 'N')
            const rejectlArr = this.userSequenceArr
                .filter(item => item.status === 'CR')
            const pickoutArr = this.userSequenceArr
                .filter(item => item.status === 'P')
            const changeNormalArr = this.userSequenceArr
                .filter(item => item.changeStatus && item.status === 'N')
            const changeRejectArr = this.userSequenceArr
                .filter(item => item.changeStatus && item.status === 'CR')
            const changePickoutArr = this.userSequenceArr
                .filter(item => item.changeStatus && item.status === 'P')
            this.userCounts.normal = normalArr.length
            this.userCounts.reject = rejectlArr.length
            this.userCounts.pickout = pickoutArr.length
            this.userCounts.changeNormal = changeNormalArr.length
            this.userCounts.changeReject = changeRejectArr.length
            this.userCounts.changePickout = changePickoutArr.length
            this.userCounts.total = this.userSequenceArr.length
        },
        setStatus(obj) {
            this.sequenceArrPool = this.sequenceArrPool
                .map(item => {
                    if (item.barcode === obj.barcode)
                        item.userSetStatus = obj.status || item.status
                    return item
                })
            this.filterSequence(this.dataFilterStatus)
        },
        resetData() {
            this.sequenceArr = []
            this.sequenceArrPool = []
            this.userSequenceArr = []
            this.dataFilterStatus = ''
            this.orderCountsTotal = 0
            Object.keys(this.userCounts).forEach(key => {
                this.userCounts[key] = 0
            })
            Object.keys(this.changeCounts).forEach(key => {
                this.changeCounts[key] = 0
            })
        },
        clearInputBarcode() {
            this.inputBarcode = ''
        },
        handleStepChange() {
            this.stepDisable = true
        },
        handleTargetChange(target) {
            if (target === 'single')
                this.PRShow = true
            else {
                this.form.status = ''
                this.form.remarks = ''
                this.remarksShow = false
                this.PRShow = false
                this.allowChangeStatus = false
                this.allowSequence = false
            }
        },
        handleStatusChange(status) {
            this.remarksShow = true
            if (status === 'N')
                this.remarksShow = false
            this.form.remarks = ''
        },
        ConfirmEnterBarcode() {
            const config = {
                title: this.$t('WARNING'),
                content: this.$t('ConfirmEnterBarcode',
                    {
                        id: this.inputBarcode,
                        status: this.statusMap[this.form.status]
                    }),
                okText: this.$t('OK'),
                onOk: this.handleBarcodeEnter
            }
            this.form.status && this.form.status !== 'N'
                ? this.$Modal.confirm(config) : this.handleBarcodeEnter()
        },
        handleBarcodeEnter() {
            this.allowSequence
                ? this.addToSequence() : this.updateProgress('form')
        },
        updateProgress(name, inputObj) {
            this.$refs[name].validate(valid => {
                if (!valid) {
                    this.$Message.error('Please correct the errors below.')
                    return
                }
                else if (!this.inputBarcode && !inputObj) {
                    this.$Message.error(this.$t('Error.UpdateProgress.NoBarcode'))
                    return
                }
                this.apiLoading = true
                this.$refs.BarcodeInput.$refs.input.blur()
                const postObj = inputObj || {
                    order_id: this.form.orderID,
                    barcode: this.inputBarcode,
                    target: this.form.target,
                    progress: this.form.step,
                    status: this.form.status,
                    remarks: this.form.remarks
                }
                const params = {
                    inputObj: inputObj,
                    obj: postObj
                }
                const config = {
                    method: 'post',
                    path: '/1/ins/c/data/progress/update/',
                    obj: postObj,
                    params: params,
                    success: this.updateProgressSuccess,
                    error: this.updateProgressError,
                    final: () => {
                        this.getSequence()
                        this.clearInputBarcode()
                        this.apiLoading = false
                    }
                }
                this.ajax(config)
            })
        },
        updateProgressSuccess(response, params) {
            this.form.remarks = ''
            this.addNotice(params.obj.barcode, 'success')
            this.$refs.BarcodeInput.$refs.input.focus()
            if (params.inputObj) {
                this.sequenceArrPool = this.sequenceArrPool
                    .filter(item => item.barcode !== params.obj.barcode)
                this.userSequenceArr = this.userSequenceArr
                    .filter(item => item.barcode !== params.obj.barcode)
                this.filterSequence(this.dataFilterStatus)
            }
        },
        updateProgressError(response, params) {
            var errMsg = ''
            if (response.status === 400) {
                switch (parseInt(response.data.code)) {
                case 1:
                    // 無效更新進度
                    errMsg = this.$t('Error.UpdateProgress.Code1')
                    break
                case 2:
                    // 無效更新狀態
                    errMsg = this.$t('Error.UpdateProgress.Code2')
                    break
                case 3:
                    // 無效更新，進度"已交寄"才可以使用抽件
                    errMsg = this.$t('Error.UpdateProgress.Code3')
                    break
                case 4:
                    // 無效更新，條碼不存在
                    errMsg = this.$t('Error.UpdateProgress.Code4')
                    break
                case 5:
                    // 無效更新，非指定動作操作序列
                    errMsg = this.$t('Error.UpdateProgress.Code5')
                    break
                case 6:
                    // 無效更新，操作序列不允許執行: 條碼與使用者不符
                    errMsg = this.$t('Error.UpdateProgress.Code6')
                    break
                case 7:
                    // 無效更新，操作序列不允許執行: 批次任務不得在驗單與封裝進度時執行
                    errMsg = this.$t('Error.UpdateProgress.Code7')
                    break
                default:
                    // 未預期的錯誤
                    errMsg = this.$t('Error.Unexpected')
                    break
                }
            }
            else if (response.status) errMsg += this.unexpectedErrMsg(response)

            this.$Modal.error({
                title: this.$t('ERROR'),
                content: `<${params.obj.barcode}>${errMsg}`,
                okText: this.$t('OK')
            })
            this.addNotice(params.obj.barcode, 'error', errMsg)
            this.errorSound()
            console.error(response)
        },
        updateSequence() {
            this.userSequenceArr
                .forEach(item => this.updateProgress('form', item))
        },
        confirmSubmit() {
            if (this.conflictCount > 0 || this.userReject > 0) {
                const config = {
                    title: '警告',
                    content: `尚有未指定的變更 ${this.conflictCount} 筆，
                              自行驗退 ${this.userReject} 筆，是否確定提交？`,
                    okText: this.$t('OK'),
                    onOk: this.updateSequence
                }
                this.$Modal.confirm(config)
            }
            else this.updateSequence()
        },
        errorSound() {
            if (this.$refs.audio) this.$refs.audio.play()
        },
        addNotice(paramsTitle = '', paramsStatus = '', paramsMsg = '') {
            const d = new Date()
            const obj = {
                status: paramsStatus,
                title: paramsTitle,
                key: d.getTime(),
                msg: paramsMsg
            }
            if (obj.status === 'success') this.noticeArr.unshift(obj)
            else this.errorNoticeArr.unshift(obj)
        },
        addToSequence() {
            const originMap = this.sequenceArrPool
                .map(item => item.barcode)
            if (originMap.indexOf(this.inputBarcode) === -1) {
                const msg = this.$t('BarcodeNotInOrder', { barcode: this.inputBarcode })
                this.$Message.error(msg)
                return
            }
            const obj = {
                order_id: this.form.orderID,
                barcode: this.inputBarcode,
                target: this.form.target,
                progress: this.form.step,
                status: this.form.status,
                remarks: this.form.remarks
            }
            const userMap = this.userSequenceArr
                .map(item => item.barcode)
            // Set Sequence item status
            this.setStatus(obj)
            const index = userMap.indexOf(this.inputBarcode)
            if (index === -1) this.userSequenceArr.push(obj)
            else this.userSequenceArr[index] = obj
            this.setUserCounts()
            this.clearInputBarcode()
        },
        disableSubmit() {
            if (this.sequenceArrPool.length === 0)
                return true
            if (this.sequenceArrPool.length !== this.userSequenceArr.length)
                return true
            return false
        },
        filterSequence(params) {
            switch (params) {
            case 'all':
                this.sequenceArr = this.sequenceArrPool
                break
            case 'change':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => item.changeStatus)
                break
            case 'none_all':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => item.userSetStatus === 'none')
                break
            case 'none_change':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus === 'none' &&
                            item.changeStatus
                    })
                break
            case 'none_change_normal':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus === 'none' &&
                            item.changeStatus === 'N'
                    })
                break
            case 'none_change_reject':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus === 'none' &&
                                item.changeStatus === 'CR'
                    })
                break
            case 'none_change_pickout':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus === 'none' &&
                                item.changeStatus === 'P'
                    })
                break
            case 'user_all':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus === 'N' ||
                                item.userSetStatus === 'CR' ||
                                item.userSetStatus === 'P'
                    })
                break
            case 'user_normal':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => item.userSetStatus === 'N')
                break
            case 'user_reject':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => item.userSetStatus === 'CR')
                break
            case 'user_picker':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => item.userSetStatus === 'P')
                break
            case 'user_conflict':
                this.sequenceArr = this.sequenceArrPool
                    .filter(item => {
                        return item.userSetStatus !== 'none' &&
                                item.userSetStatus !== item.changeStatus
                    })
                break
            default:
                this.sequenceArr = this.sequenceArrPool
                break
            }
        }
    },
    watch: {
        allowChangeStatus(data) {
            this.form.status = ''
            this.form.remarks = ''
            this.remarksShow = false
        },
        noticeArr(data) {
            if (data.length > 0) {
                this.hasNotice = true
                if (this.noticeTimer === null) {
                    this.noticeTimer = setInterval(() => {
                        this.noticeArr.pop()
                    }, 1500)
                }
            }
            else {
                clearInterval(this.noticeTimer)
                const t = setTimeout(() => {
                    if (this.errorNoticeArr.length === 0)
                        this.hasNotice = false
                    clearTimeout(t)
                }, 2000)
                this.noticeTimer = null
            }
        },
        errorNoticeArr(data) {
            if (data.length > 0)
                this.hasNotice = true
            else if (data.length === 0 && this.noticeArr.length === 0)
                this.hasNotice = false
        },
        dataFilterStatus(data) {
            this.filterSequence(data)
        },
        userSequenceArr() {
            this.setUserCounts()
        },
        'form.step': function(val, oldVal) {
            if (val === 'CK' || val === 'PO') {
                this.getOperation()
                this.allowSequence = true
            }
            else this.allowSequence = false
        }
    },
    computed: {
        changeCountsTotal() {
            let total = 0
            total += this.changeCounts.normal
            total += this.changeCounts.reject
            total += this.changeCounts.pickout
            return total
        },
        userReject() {
            const arr = this.sequenceArrPool
                .filter(item => {
                    return item.status === 'N' &&
                            item.userSetStatus === 'CR' &&
                            !item.changeStatus
                })
            return arr.length
        },
        conflictCount() {
            const arr = this.sequenceArrPool
                .filter(item => {
                    return item.userSetStatus !== 'none' &&
                            item.changeStatus &&
                            item.userSetStatus !== item.changeStatus
                })
            return arr.length
        }
    }
}
</script>