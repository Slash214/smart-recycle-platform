<template>
    <view class="page">
        <!-- 状态 -->
        <view class="card status-card">

            <image
                src="@/static/order-status-icon.png"
                class="status-ico"
                mode="aspectFit"
                lazy-load
            />
            <text class="status-text">{{ inboundTitle }}</text>
        </view>

        <!-- 订单信息 -->
        <view class="card info-card">
            <view class="info-row">
                <text class="label">物流单号</text>
                <view class="info-right">
                    <text class="value ellipsis">{{ logisticsLine }}</text>
                    <view class="v-divider"></view>
                    <text class="copy-btn" @click.stop="copyLogistics">复制</text>
                </view>
            </view>
            <view class="info-row align-start">
                <text class="label">仓库地址</text>
                <text class="value multiline">{{ warehouseText }}</text>
            </view>
            <view class="info-row">
                <text class="label">收款方式</text>
                <text class="value">{{ payWayText }}</text>
            </view>
            <view class="info-row last">
                <text class="label">报单时间</text>
                <text class="value">{{ createdText }}</text>
            </view>
        </view>

        <!-- 商品明细 -->
        <view class="goods-head">
            <text class="goods-title">商品明细</text>
            <text class="goods-count">共{{ nums }}件</text>
        </view>
        <view class="card goods-card">
            <view class="goods-line">
                <text class="goods-name">回收商品×{{ nums }}</text>
            </view>
            <view class="price-line">
                <text class="price-label">结算价格:</text>
                <text class="price-num">{{ settlementPriceText }}</text>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, getMiniDefaultAddress } from '@/apis'

interface OrderDetail {
    id: number
    nums: number
    price: string | null
    phone?: string
    remark?: string
    express_company?: string
    tracking_number?: string
    areas?: string | null
    way?: number
    inbound_status?: number
    settlement_status?: number
    createdAt?: string
}

const order = ref<OrderDetail | null>(null)
const warehouseFallback = ref('')

const nums = computed(() => Number(order.value?.nums || 0))

const inboundTitle = computed(() => {
    const ib = order.value?.inbound_status
    if (ib === 20) return '已入库'
    return '待入库'
})

const logisticsLine = computed(() => {
    const o = order.value
    if (!o) return '-'
    const company = o.express_company || ''
    const no = o.tracking_number || ''
    if (company && no) return `${company} ${no}`
    return company || no || '-'
})

const warehouseText = computed(() => {
    const a = order.value?.areas
    if (a && String(a).trim()) return String(a).trim()
    return warehouseFallback.value || '—'
})

const payWayText = computed(() => {
    const w = order.value?.way
    const map: Record<number, string> = {
        1: '微信',
        2: '支付宝',
        3: '银行卡',
    }
    return w ? map[w] || '-' : '-'
})

const createdText = computed(() => {
    const raw = order.value?.createdAt
    if (!raw) return '-'
    const d = new Date(raw)
    if (Number.isNaN(d.getTime())) return raw
    const y = d.getFullYear()
    const m = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hh = String(d.getHours()).padStart(2, '0')
    const mm = String(d.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${day} ${hh}:${mm}`
})

const settlementPriceText = computed(() => {
    const p = order.value?.price
    if (p === null || p === undefined || String(p).trim() === '') return '--'
    const n = Number(p)
    if (!Number.isNaN(n)) return n.toFixed(2)
    return String(p)
})

function normalizeDetail(payload: unknown): OrderDetail | null {
    if (!payload || typeof payload !== 'object') return null
    return payload as OrderDetail
}

async function load(id: number) {
    try {
        const raw = await getOrderDetail(id)
        order.value = normalizeDetail(raw)
        if (!order.value?.areas || !String(order.value.areas).trim()) {
            const addr = await getMiniDefaultAddress()
            if (addr) {
                warehouseFallback.value =
                    String(addr.fullAddress || addr.address || '').trim() || ''
            }
        }
    } catch {
        uni.showToast({ title: '加载失败', icon: 'none' })
    }
}

function copyLogistics() {
    const t = logisticsLine.value
    if (!t || t === '-') return
    uni.setClipboardData({
        data: t,
        success: () => uni.showToast({ title: '已复制', icon: 'none' }),
    })
}

onLoad((options) => {
    const id = Number(options?.id || 0)
    if (!id) {
        uni.showToast({ title: '参数错误', icon: 'none' })
        return
    }
    load(id)
})
</script>

<style scoped lang="scss">
@import '@/styles/recycle-ui.scss';

.page {
    min-height: 100vh;
    background: $recycle-bg;
    padding: 24rpx;
    padding-bottom: calc(32rpx + env(safe-area-inset-bottom));
    box-sizing: border-box;
}

.card {
    background: $recycle-surface;
    border-radius: 24rpx;
    margin-bottom: 24rpx;
    padding: 32rpx 28rpx;
    border: 1rpx solid $recycle-border-light;
}

/* 状态 */
.status-card {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 12rpx;
    padding: 36rpx 28rpx;
    // background: $recycle-accent-soft;
    background-color: #fff;
    border-color: $recycle-accent-muted;
}

.status-ico {
    width: 48rpx;
    height: 48rpx;
    object-fit: contain;
    display: block;
    flex-shrink: 0;
    image-rendering: -webkit-optimize-contrast;
    transform: translateZ(0);
}

.status-text {
    font-size: 34rpx;
    font-weight: 600;
    color: $recycle-accent-dark;
}

/* 信息块 */
.info-card {
    padding: 8rpx 28rpx 28rpx;
}

.info-row {
    display: flex;
    align-items: center;
    justify-content: flex-start;
    padding: 24rpx 0;
    border-bottom: 1rpx solid $recycle-border-light;
    gap: 24rpx;

    &.last {
        border-bottom: none;
    }

    &.align-start {
        align-items: flex-start;
    }
}

.label {
    flex-shrink: 0;
    width: 160rpx;
    font-size: 28rpx;
    color: $recycle-text-secondary;
}

.value {
    flex: 1;
    font-size: 28rpx;
    color: $recycle-text;
    text-align: left;

    &.multiline {
        text-align: left;
        line-height: 1.55;
    }
}

.info-right {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    min-width: 0;
    gap: 16rpx;
}

.ellipsis {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    text-align: left;
}

.v-divider {
    width: 1rpx;
    height: 28rpx;
    background: $recycle-border;
    flex-shrink: 0;
}

.copy-btn {
    flex-shrink: 0;
    font-size: 26rpx;
    color: $recycle-accent;
    font-weight: 500;
    padding: 8rpx 0 8rpx 8rpx;
}

/* 商品明细 */
.goods-head {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 8rpx 8rpx 20rpx;
}

.goods-title {
    font-size: 30rpx;
    font-weight: 600;
    color: $recycle-text;
}

.goods-count {
    font-size: 26rpx;
    color: $recycle-muted;
}

.goods-card {
    padding: 28rpx;
}

.goods-line {
    margin-bottom: 20rpx;
}

.goods-name {
    font-size: 30rpx;
    color: $recycle-text;
    font-weight: 500;
}

.price-line {
    display: flex;
    align-items: baseline;
    gap: 8rpx;
}

.price-label {
    font-size: 26rpx;
    color: $recycle-text-secondary;
}

.price-num {
    font-size: 32rpx;
    font-weight: 600;
    color: $recycle-accent;
}
</style>
