<template>
    <view class="page">
        <wd-tabs v-model="mainTab" @click="handleMainTabClick">
            <wd-tab title="入库订单"></wd-tab>
            <wd-tab title="结算状态"></wd-tab>
        </wd-tabs>
        <view class="search-row">
            <input v-model.trim="keyword" class="search-input" placeholder="搜索关键词" />
            <view class="search-btn" @click="fetchOrders">搜索</view>
        </view>
        <scroll-view class="sub-tabs" scroll-x :show-scrollbar="false" enhanced>
            <view
                v-for="item in currentSubTabs"
                :key="item.id"
                :class="['sub-item', currentSubTab === item.id ? 'active' : '']"
                @click="onSubTabChange(item.id)"
            >
                {{ item.name }}
            </view>
        </scroll-view>
        <view class="container">
            <order-card v-for="item in list" :key="item.id" :order="item"></order-card>
            <empty-state v-if="!list.length && !loading" tip="空空如也"></empty-state>
            <view v-if="loading" class="loading-text">加载中...</view>
            <view v-if="!hasMore && list.length" class="loading-text">没有更多了</view>
        </view>
        <view v-if="mainTab === 1" class="bottom-btn">我要退货</view>
    </view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getOrderList } from '@/apis'
import OrderCard from '@/components/OrderCard.vue'
import EmptyState from '@/components/EmptyState.vue'

interface Order {
    id: number
    phone: string
    nums: number
    type: number
    way: number
    tracking_number: string
    express_company: string
    inbound_status: 10 | 20
    settlement_status: 10 | 20 | 30 | 40 | 50
    createdAt: string
}

const list = ref<Order[]>([])
const keyword = ref('')
const page = ref(1)
const pageSize = 20
const loading = ref(false)
const hasMore = ref(true)

const mainTab = ref(0)
const currentSubTab = ref('pendingInbound')
const inboundTabs = [
    { id: 'pendingInbound', name: '待入库单' },
    { id: 'pendingSettlement', name: '待结算单' },
]
const settlementTabs = [
    { id: 'waitQuote', name: '待报价' },
    { id: 'quoted', name: '已报价' },
    { id: 'waitSettle', name: '待结算' },
    { id: 'settled', name: '已结算' },
    { id: 'returning', name: '退货中' },
]
const currentSubTabs = computed(() => (mainTab.value === 0 ? inboundTabs : settlementTabs))

const buildQuery = () => {
    const query: Record<string, any> = { page: page.value, pageSize }
    if (keyword.value) query.keyword = keyword.value
    if (mainTab.value === 0) {
        if (currentSubTab.value === 'pendingInbound') {
            query.inbound_status = 10
            query.settlement_status = 10
        } else if (currentSubTab.value === 'pendingSettlement') {
            query.inbound_status = 20
            query.settlement_status = 30
        }
        return query
    }
    const settlementMap: Record<string, number> = {
        waitQuote: 10,
        quoted: 20,
        waitSettle: 30,
        settled: 40,
        returning: 50,
    }
    query.settlement_status = settlementMap[currentSubTab.value]
    return query
}

const fetchOrders = async (reset = true) => {
    if (loading.value) return
    if (reset) {
        page.value = 1
        hasMore.value = true
    } else if (!hasMore.value) {
        return
    }
    loading.value = true
    try {
        const data = await getOrderList(buildQuery() as any)
        const rows = (data?.list || data?.data || []) as Order[]
        list.value = reset ? rows : [...list.value, ...rows]
        hasMore.value = rows.length >= pageSize
        if (rows.length >= pageSize) page.value += 1
    } finally {
        loading.value = false
    }
}

const handleMainTabClick = (e: any) => {
    const current = Number(e?.name ?? mainTab.value ?? 0)
    mainTab.value = current
    currentSubTab.value = current === 0 ? 'pendingInbound' : 'waitQuote'
    fetchOrders(true)
}

const onSubTabChange = (id: string) => {
    currentSubTab.value = id
    fetchOrders(true)
}

onLoad((options) => {
    const sourceType = Number(options?.type || 0)
    if (sourceType === 1) {
        mainTab.value = 0
        currentSubTab.value = 'pendingSettlement'
    } else if (sourceType === 2) {
        mainTab.value = 1
        currentSubTab.value = 'settled'
    } else {
        mainTab.value = 0
        currentSubTab.value = 'pendingInbound'
    }
    fetchOrders(true)
})

onPullDownRefresh(async () => {
    await fetchOrders(true)
    uni.stopPullDownRefresh()
})

onReachBottom(async () => {
    await fetchOrders(false)
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 200rpx;
}

.search-row {
    display: flex;
    align-items: center;
    gap: 16rpx;
    padding: 20rpx 24rpx 0;
}

.search-input {
    flex: 1;
    height: 68rpx;
    border-radius: 14rpx;
    background: #fff;
    border: 1px solid #eef0f4;
    padding: 0 20rpx;
}

.search-btn {
    width: 124rpx;
    height: 68rpx;
    border-radius: 14rpx;
    background: #fffbe8;
    border: 1px solid #f1e9c8;
    color: #1f2937;
    display: flex;
    align-items: center;
    justify-content: center;
}

.sub-tabs {
    display: flex;
    align-items: center;
    gap: 28rpx;
    padding: 20rpx 24rpx 8rpx;
    white-space: nowrap;
}

.sub-item {
    display: inline-flex;
    margin-right: 16rpx;
    color: #1f2937;
    font-size: 30rpx;
    line-height: 54rpx;
    padding: 0 20rpx;
    border-radius: 27rpx;
    white-space: nowrap;
}

.active {
    background: #3f6bff;
    color: #fff;
}

.container {
    padding: 18rpx 24rpx;
    min-height: 60vh;
}

.bottom-btn {
    position: fixed;
    bottom: 26rpx;
    left: 24rpx;
    right: 24rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: #3f6bff;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34rpx;
}

.loading-text {
    text-align: center;
    color: #9ca3af;
    font-size: 26rpx;
    padding: 24rpx 0;
}
</style>
