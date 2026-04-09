<template>
    <view :class="['order-card', selected ? 'selected' : '']" @click="handleClick">
        <view class="header">
            <text class="courier">{{ order.express_company || '-' }}</text>
            <view class="header-right">
                <text class="status">{{ statusText }}</text>
                <text v-if="selectable" :class="['pick-tag', selected ? 'on' : '']">
                    {{ selected ? '已选择' : '可选择' }}
                </text>
            </view>
        </view>
        <view class="content">
            <view class="row">
                <text class="label">运单号：</text>
                <text class="value">{{ order.tracking_number || '-' }}</text>
            </view>
            <view class="row">
                <text class="label">联系电话：</text>
                <wd-text :text="order.phone || '-'" mode="phone" :format="true"></wd-text>
            </view>
            <view class="row">
                <text class="label">数量：</text>
                <text class="value">{{ order.nums || 0 }}</text>
            </view>
            <view v-if="deviceSummary" class="row device-summary-row">
                <text class="label">明细：</text>
                <text class="value summary">{{ deviceSummary }}</text>
            </view>
            <view class="row price-row">
                <text class="label">收款方式：</text>
                <text class="value price-value">{{ payWayText }}</text>
            </view>
        </view>
        <view class="footer">
            <text class="time">{{ formattedCreatedAt }}</text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, defineProps } from 'vue'

/** 订单数据结构 */
interface Order {
    id: number
    phone: string
    nums: number
    type: number
    way: number
    tracking_number: string
    express_company: string
    status: number
    createdAt: string
    devices?: Array<{ model?: string; memory?: string; unit?: string; qty?: number }>
}

const props = defineProps<{
    order: Order
    selectable?: boolean
    selected?: boolean
}>()
const emit = defineEmits<{
    (e: 'choose', id: number): void
}>()

const statusText = computed(() => {
    switch (props.order.status) {
        case 10:
            return '已下单'
        case 20:
            return '已签收'
        case 30:
            return '已报价'
        case 40:
            return '已确认'
        case 50:
            return '已返款'
        case 60:
            return '已完成'
        default:
            return '未知状态'
    }
})

const deviceSummary = computed(() => {
    const ds = props.order.devices
    if (!Array.isArray(ds) || !ds.length) return ''
    return ds
        .map((d) => {
            const u = d.unit === 'board' ? '单板' : '整机'
            return `${d.model || '-'} ${d.memory || '-'} ${u}×${d.qty ?? 0}`
        })
        .join('；')
})

const payWayText = computed(() => {
    switch (props.order.way) {
        case 1:
            return '微信收款'
        case 2:
            return '支付宝收款'
        case 3:
            return '银行卡收款'
        default:
            return '-'
    }
})

const formattedCreatedAt = computed(() => {
    const date = new Date(props.order.createdAt)
    const y = date.getFullYear()
    const m = String(date.getMonth() + 1).padStart(2, '0')
    const d = String(date.getDate()).padStart(2, '0')
    const hh = String(date.getHours()).padStart(2, '0')
    const mm = String(date.getMinutes()).padStart(2, '0')
    return `${y}-${m}-${d} ${hh}:${mm}`
})

const goDetail = () => {
    uni.navigateTo({
        url: `/pages/order-detail/order-detail?id=${props.order.id}`,
    })
}

const handleClick = () => {
    if (props.selectable) {
        emit('choose', props.order.id)
        return
    }
    goDetail()
}
</script>

<style scoped lang="scss">
@import '@/styles/recycle-ui.scss';

.order-card {
    background-color: $recycle-surface;
    margin-bottom: 24rpx;
    padding: 32rpx;
    border-radius: 16rpx;
    border: 1rpx solid $recycle-border-light;
    transition: background 0.2s ease;

    &:active {
        background-color: $recycle-warm;
    }
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid $recycle-border-light;
}

.header-right {
    display: flex;
    align-items: center;
    gap: 10rpx;
}

.courier {
    font-size: 36rpx;
    font-weight: 700;
    color: $recycle-text;
    line-height: 1.4;
}

.status {
    font-size: 26rpx;
    color: $recycle-accent-dark;
    font-weight: 600;
    padding: 8rpx 18rpx;
    background: $recycle-accent-soft;
    border-radius: 8rpx;
    border: 1rpx solid $recycle-accent-muted;
}

.pick-tag {
    font-size: 22rpx;
    padding: 6rpx 12rpx;
    border-radius: 8rpx;
    border: 1rpx dashed $recycle-accent-muted;
    color: $recycle-muted;
}

.pick-tag.on {
    border-style: solid;
    color: $recycle-accent-dark;
    background: $recycle-accent-soft;
}

.content {
    margin-bottom: 24rpx;
}

.row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 16rpx;
    font-size: 28rpx;
    line-height: 1.6;

    &:last-child {
        margin-bottom: 0;
    }
}

.label {
    color: $recycle-text-secondary;
    margin-right: 16rpx;
    min-width: 140rpx;
    font-weight: 400;
}

.value {
    color: $recycle-text;
    font-weight: 500;
    flex: 1;
}

.price-row {
    margin-top: 12rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid $recycle-border-light;
}

.price-value {
    color: $recycle-accent;
    font-weight: 600;
    font-size: 30rpx;
}

.device-summary-row {
    align-items: flex-start;
    .summary {
        font-size: 24rpx;
        line-height: 1.45;
        word-break: break-all;
    }
}

.footer {
    text-align: right;
    padding-top: 20rpx;
    border-top: 1rpx solid $recycle-border-light;
}

.time {
    font-size: 24rpx;
    color: $recycle-muted;
    line-height: 1.4;
}

.order-card.selected {
    border-color: $recycle-accent;
    background: #f3f6ff;
}
</style>
