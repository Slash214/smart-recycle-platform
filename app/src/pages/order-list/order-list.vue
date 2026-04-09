<template>
    <view class="page">
        <view class="tabs-surface">
            <wd-tabs v-model="mainTab" @click="handleMainTabClick">
                <wd-tab title="入库订单"></wd-tab>
                <wd-tab title="结算状态"></wd-tab>
            </wd-tabs>
        </view>
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
            <view v-if="isReturnPickMode && list.length" class="pick-tip">请选择一个已结算订单发起退货</view>
            <order-card
                v-for="item in list"
                :key="item.id"
                :order="item"
                :selectable="isReturnPickMode"
                :selected="selectedReturnOrderId === item.id"
                @choose="onChooseReturnOrder"
            ></order-card>
            <empty-state v-if="!list.length && !loading" tip="空空如也"></empty-state>
            <view v-if="loading" class="loading-text">加载中...</view>
            <view v-if="!hasMore && list.length" class="loading-text">没有更多了</view>
        </view>
        <view
            v-if="isReturnPickMode"
            :class="['bottom-btn', !selectedReturnOrderId ? 'disabled' : '']"
            @click="goApplyReturnFromList"
        >
            {{ selectedReturnOrderId ? '申请退货' : '请选择一个订单' }}
        </view>
    </view>
</template>

<script lang="ts" setup>
import { onLoad, onPullDownRefresh, onReachBottom, onShow } from '@dcloudio/uni-app'
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
const selectedReturnOrderId = ref<number | null>(null)
const initialized = ref(false)

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
const isReturnPickMode = computed(() => mainTab.value === 1 && currentSubTab.value === 'settled')

/** 后端 list 接口的 data 直接是数组；兼容 { list/data/rows } 包裹形态 */
function normalizeOrderRows(payload: unknown): Order[] {
    if (Array.isArray(payload)) return payload as Order[]
    if (payload && typeof payload === 'object') {
        const o = payload as { list?: unknown; data?: unknown; rows?: unknown }
        const rows = o.list ?? o.data ?? o.rows
        return Array.isArray(rows) ? (rows as Order[]) : []
    }
    return []
}

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
        const rows = normalizeOrderRows(data)
        list.value = reset ? rows : [...list.value, ...rows]
        if (reset) selectedReturnOrderId.value = null
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
    selectedReturnOrderId.value = null
    fetchOrders(true)
}

const onChooseReturnOrder = (id: number) => {
    if (!isReturnPickMode.value) return
    selectedReturnOrderId.value = selectedReturnOrderId.value === id ? null : id
}

const goApplyReturnFromList = () => {
    if (!selectedReturnOrderId.value) {
        uni.showToast({ title: '请先选择一个已结算订单', icon: 'none' })
        return
    }
    uni.navigateTo({ url: `/pages/order-detail/order-detail?id=${selectedReturnOrderId.value}` })
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
    initialized.value = true
})

onShow(() => {
    // 从详情页/申请页返回后自动刷新状态
    if (!initialized.value) return
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
@import '@/styles/recycle-ui.scss';

.page {
    min-height: 100vh;
    background-color: $recycle-bg;
    padding-bottom: 200rpx;
}

.tabs-surface {
    background: $recycle-surface;
    border-bottom: 1rpx solid $recycle-border-light;
}

/* 顶部 Tab 与回收绿主色对齐（wot-design 结构） */
:deep(.wd-tabs__nav) {
    background: $recycle-surface !important;
}
:deep(.wd-tabs__nav-item.is-active) {
    color: $recycle-accent !important;
    font-weight: 600;
}
:deep(.wd-tabs__line) {
    background: $recycle-accent !important;
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
    background: $recycle-surface;
    border: 1rpx solid $recycle-border;
    padding: 0 20rpx;
    color: $recycle-text;
}

.search-btn {
    width: 124rpx;
    height: 68rpx;
    border-radius: 14rpx;
    background: $recycle-accent-soft;
    border: 1rpx solid $recycle-accent-muted;
    color: $recycle-accent-dark;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: 500;
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
    color: $recycle-text-secondary;
    font-size: 30rpx;
    line-height: 54rpx;
    padding: 0 22rpx;
    border-radius: 27rpx;
    white-space: nowrap;
    border: 1rpx solid transparent;
}

.active {
    background: $recycle-accent-soft;
    color: $recycle-accent-dark;
    border-color: $recycle-accent-muted;
    font-weight: 600;
}

.container {
    padding: 18rpx 24rpx;
    min-height: 60vh;
}

.pick-tip {
    margin-bottom: 14rpx;
    padding: 14rpx 16rpx;
    border-radius: 12rpx;
    border: 1rpx solid $recycle-accent-muted;
    background: $recycle-accent-soft;
    font-size: 24rpx;
    color: $recycle-accent-dark;
}

.bottom-btn {
    position: fixed;
    bottom: 26rpx;
    left: 24rpx;
    right: 24rpx;
    height: 88rpx;
    border-radius: 44rpx;
    background: $recycle-accent;
    color: #fff;
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 34rpx;
    font-weight: 600;
    border: 1rpx solid $recycle-accent-dark;
}

.bottom-btn.disabled {
    background: #b8c4f0;
    border-color: #9cacdf;
}

.loading-text {
    text-align: center;
    color: $recycle-muted;
    font-size: 26rpx;
    padding: 24rpx 0;
}
</style>
