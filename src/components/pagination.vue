<template>
    <div v-if="dataPoolLength && dataPoolLength > 10" class="pagination">
        <div class="pagination__skip-icon"
            :class="{'item-disable': pageIndex == 0}"
            @click.stop="pageIndex = 0">
            <Icon type="ios-skip-backward" />
        </div>
        <Page show-sizer
            simple
            :page-size="pageLimit"
            :total="dataPoolLength"
            :current="pageIndex + 1"
            @on-change="pageChange"/>
        <div class="pagination__skip-icon"
            :class="{'item-disable': pageIndex == dataLength -1}"
            @click.stop="pageIndex = dataLength -1">
            <Icon type="ios-skip-forward" />
        </div>
        <Select v-model="pageLimit"
                size="small"
                class="noselect ml-15"
                style="width: auto;">
            <Option v-for="item in limitList"
                    :value="item.value"
                    :key="item.value"
                    :label="item.label"/>
        </Select>
    </div>
</template>
<script>
export default {
    name: 'Pagination',
    props: {
        dataLength: {
            type: Number
        },
        dataPoolLength: {
            type: Number,
            default: 0
        },
        value: {
            type: Number,
            default: 0
        },
        limit: {
            type: Number
        }
    },
    data() {
        return {
            pageIndex: 0,
            pageLimit: 10,
            limitList: [
                {
                    value: 10,
                    label: '10 ' + this.$t('Records')
                },
                {
                    value: 15,
                    label: '15 ' + this.$t('Records')
                },
                {
                    value: 20,
                    label: '20 ' + this.$t('Records')
                },
                {
                    value: 25,
                    label: '25 ' + this.$t('Records')
                },
                {
                    value: 30,
                    label: '30 ' + this.$t('Records')
                }
            ]
        }
    },
    methods: {
        pageChange(data) {
            this.pageIndex = data - 1
        },
        handleData(input) {
            this.pageIndex = 0
            let arr = []
            const data = []
            const dataPool = this.deepCopy(input)
            dataPool.forEach(element => {
                if (arr.length < this.pageLimit)
                    arr.push(element)
                else {
                    data.push(arr)
                    arr = []
                    arr.push(element)
                }
            })
            if (arr.length > 0) data.push(arr)
            return data
        }
    },
    watch: {
        pageLimit(data) {
            this.pageIndex = 0
            this.$emit('reflash-limit', data)
        },
        value(data) {
            if (!isNaN(parseInt(data))) this.pageIndex = data
        },
        pageIndex(data) {
            this.$emit('input', data)
        },
        limit(data) {
            if (this.pageLimit !== data) this.pageLimit = data
        }
    }
}
</script>