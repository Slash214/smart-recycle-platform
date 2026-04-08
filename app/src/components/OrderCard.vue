<template>
    <view class="order-card">
        <view class="header">
            <text class="courier">{{ order.express_company || '-' }}</text>
            <text class="status">{{ statusText }}</text>
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
    inbound_status: number
    settlement_status: number
    createdAt: string
}

const props = defineProps<{
    order: Order
}>()

const statusText = computed(() => {
    switch (props.order.settlement_status) {
        case 10:
            return '待报价'
        case 20:
            return '已报价'
        case 30:
            return '待结算'
        case 40:
            return '已结算'
        case 50:
            return '退货中'
        default:
            return '未知状态'
    }
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
</script>

<style scoped lang="scss">
.order-card {
    background-color: #fff;
    margin-bottom: 24rpx;
    padding: 32rpx;
    border-radius: 16rpx;
    box-shadow: 0 2rpx 12rpx rgba(0, 0, 0, 0.06);
    transition: all 0.3s;

    &:active {
        transform: scale(0.98);
        box-shadow: 0 2rpx 8rpx rgba(0, 0, 0, 0.08);
    }
}

.header {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    padding-bottom: 20rpx;
    border-bottom: 1rpx solid #f0f0f0;
}

.courier {
    font-size: 36rpx;
    font-weight: 700;
    color: #222;
    line-height: 1.4;
}

.status {
    font-size: 28rpx;
    color: #1957ff;
    font-weight: 500;
    padding: 8rpx 16rpx;
    background: rgba(25, 87, 255, 0.08);
    border-radius: 8rpx;
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
    color: #666;
    margin-right: 16rpx;
    min-width: 140rpx;
    font-weight: 400;
}

.value {
    color: #333;
    font-weight: 500;
    flex: 1;
}

.price-row {
    margin-top: 12rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #f5f5f5;
}

.price-value {
    color: #1957ff;
    font-weight: 600;
    font-size: 30rpx;
}

.footer {
    text-align: right;
    padding-top: 20rpx;
    border-top: 1rpx solid #f5f5f5;
}

.time {
    font-size: 24rpx;
    color: #999;
    line-height: 1.4;
}
</style>
