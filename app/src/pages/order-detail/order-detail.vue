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
            <view class="info-row align-start">
                <text class="label">收款信息</text>
                <text class="value multiline">{{ payoutInfoText }}</text>
            </view>
            <view class="info-row last">
                <text class="label">报单时间</text>
                <text class="value">{{ createdText }}</text>
            </view>
        </view>

        <!-- 回收明细 -->
        <view class="goods-head">
            <text class="goods-title">回收明细</text>
            <text class="goods-count">共{{ nums }}件</text>
        </view>
        <view v-if="deviceLines.length" class="card goods-card device-lines">
            <view v-for="(d, idx) in deviceLines" :key="idx" class="device-row">
                <view class="device-main">
                    <text class="device-title">{{ d.model }} / {{ d.memory }} / {{ d.unit === 'board' ? '单板' : '整机' }}</text>
                    <text class="device-qty">×{{ d.qty }}</text>
                </view>
                <view class="device-price-row">
                    <text class="device-price-label">单价：</text>
                    <text v-if="d.priceText !== '--'" class="device-price-value">{{ d.priceText }}</text>
                    <text v-else class="device-price-empty">待报价</text>
                    <text class="device-price-divider">|</text>
                    <text class="device-price-label">小计：</text>
                    <text v-if="d.subtotalText !== '--'" class="device-price-value">{{ d.subtotalText }}</text>
                    <text v-else class="device-price-empty">--</text>
                </view>
            </view>
            <view class="price-line">
                <text class="price-label">结算价格:</text>
                <text class="price-num">{{ settlementPriceText }}</text>
            </view>
        </view>
        <view v-else class="card goods-card">
            <view class="goods-line">
                <text class="goods-name">回收商品×{{ nums }}</text>
            </view>
            <view class="price-line">
                <text class="price-label">结算价格:</text>
                <text class="price-num">{{ settlementPriceText }}</text>
            </view>
        </view>

        <view v-if="canUserConfirm" class="fix-bottom">
            <view v-if="canUserConfirm" class="confirm-btn" @click="confirmSettlement">确认结算</view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { getOrderDetail, getMiniDefaultAddress, updateOrder } from '@/apis'

interface OrderDevice {
    id?: number
    model: string
    memory: string
    unit: 'whole' | 'board'
    qty: number
    price?: string | null
}

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
    payee_name?: string
    wechat_account?: string
    alipay_account?: string
    bank_name?: string
    bank_card_no?: string
    status?: number
    createdAt?: string
    devices?: OrderDevice[]
}

const order = ref<OrderDetail | null>(null)
const warehouseFallback = ref('')

const nums = computed(() => Number(order.value?.nums || 0))

const deviceLines = computed(() => {
    const list = order.value?.devices
    if (!Array.isArray(list) || !list.length) return []
    return list.map((d) => ({
        model: d.model || '',
        memory: d.memory || '',
        unit: d.unit === 'board' ? 'board' as const : 'whole' as const,
        qty: Number(d.qty) || 0,
        priceText: d.price === null || d.price === undefined || String(d.price).trim() === '' ? '--' : String(d.price),
        subtotalText: (() => {
            const p = Number(d.price)
            const q = Number(d.qty) || 0
            if (!Number.isFinite(p) || q <= 0) return '--'
            return (p * q).toFixed(2)
        })(),
    }))
})

const inboundTitle = computed(() => {
    const s = order.value?.status
    const map: Record<number, string> = {
        10: '已下单',
        20: '已签收',
        30: '已报价',
        40: '已确认',
        50: '已返款',
        60: '已完成',
    }
    return s ? map[s] || '未知状态' : '未知状态'
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

const payoutInfoText = computed(() => {
    const o = order.value
    if (!o) return '-'
    if (o.way === 1) return o.wechat_account || '-'
    if (o.way === 2) return o.alipay_account || '-'
    if (o.way === 3) {
        const seg = [o.payee_name || '', o.bank_name || '', o.bank_card_no || ''].filter(Boolean)
        return seg.length ? seg.join(' / ') : '-'
    }
    return '-'
})

const canUserConfirm = computed(() => {
    const o = order.value
    if (!o) return false
    if (!o.price || String(o.price).trim() === '') return false
    return o.status === 30
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

async function confirmSettlement() {
    if (!order.value?.id) return
    try {
        uni.showLoading({ title: '确认中...', mask: true })
        await updateOrder(order.value.id, { status: 40 })
        await load(order.value.id)
        uni.showToast({ title: '已确认结算', icon: 'none' })
    } catch (err: any) {
        uni.showToast({ title: err?.message || '确认失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
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
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
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

.device-lines {
    .device-row {
        padding-bottom: 20rpx;
        margin-bottom: 20rpx;
        border-bottom: 1rpx solid $recycle-border-light;

        &:last-child {
            padding-bottom: 0;
            margin-bottom: 12rpx;
            border-bottom: none;
        }
    }

    .device-main {
        display: flex;
        justify-content: space-between;
        align-items: flex-start;
        gap: 16rpx;
    }

    .device-title {
        flex: 1;
        font-size: 28rpx;
        color: $recycle-text;
        line-height: 1.45;
    }

    .device-qty {
        font-size: 30rpx;
        font-weight: 600;
        color: $recycle-accent;
        flex-shrink: 0;
    }

    .device-price-row {
        margin-top: 10rpx;
        display: flex;
        align-items: center;
        gap: 8rpx;
        font-size: 24rpx;
    }

    .device-price-label {
        color: $recycle-text-secondary;
    }

    .device-price-value {
        color: $recycle-accent;
        font-weight: 600;
    }

    .device-price-empty {
        color: $recycle-muted;
    }

    .device-price-divider {
        color: $recycle-border;
        margin: 0 4rpx;
    }

    .price-line {
        margin-top: 4rpx;
        padding-top: 20rpx;

    }
}

.fix-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(255, 255, 255, 0.98);
    border-top: 1rpx solid $recycle-border-light;
    padding: 14rpx 24rpx calc(14rpx + env(safe-area-inset-bottom));
}

.confirm-btn {
    height: 84rpx;
    border-radius: 14rpx;
    background: $recycle-accent;
    border: 1rpx solid $recycle-accent-dark;
    color: #fff;
    font-size: 30rpx;
    font-weight: 600;
    display: flex;
    align-items: center;
    justify-content: center;
}

.confirm-btn.secondary {
    margin-top: 10rpx;
    background: #fff;
    color: $recycle-accent;
}

.return-tip {
    padding: 20rpx 24rpx;
    display: flex;
    align-items: flex-start;
    gap: 8rpx;
}

.tip-label {
    font-size: 24rpx;
    color: $recycle-text-secondary;
}

.tip-text {
    flex: 1;
    font-size: 24rpx;
    color: $recycle-text;
    line-height: 1.5;
}
</style>
