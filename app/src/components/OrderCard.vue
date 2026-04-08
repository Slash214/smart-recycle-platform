<template>
    <view class="order-card">
        <!-- 头部区域：快递公司、订单状态 -->
        <view class="header">
            <text class="courier">{{ order.shippingMethod }}</text>
            <text class="status">{{ statusText }}</text>
        </view>

        <!-- 内容区域：运单号、发件电话、快递方式、数量、价格等 -->
        <view class="content">
            <view class="row"  v-if="order.shippingMethod !== '送货上门'">
                <text class="label">运单号：</text>
                <text class="value">{{ order.trackingNumber }}</text>
            </view>

            <view class="row" v-if="order.shippingMethod !== '送货上门'">
                <text class="label">发件电话：</text>

                <wd-text :text="order.senderPhone" mode="phone" :format="true"></wd-text>
            </view>

            <view class="row">
                <text class="label">快递公司：</text>
                <text class="value">{{ order.courier }}</text>
            </view>

            <view class="row">
                <text class="label">数量：</text>
                <text class="value">{{ order.quantity }}</text>
            </view>

            <view class="row price-row">
                <text class="label">价格：</text>
                <text class="value price-value">¥{{ order.price }}</text>
            </view>
        </view>

        <!-- 底部区域：下单时间 -->
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
    courier: string
    createdAt: string
    updatedAt: string
    price: string
    quantity: number
    senderPhone: string
    shippingMethod: string
    status: number
    trackingNumber: string
    userId: number
}

/**
 * 接收订单数据的 props
 * 你可以把这个组件当做子组件，父组件中用 :order="..." 传入数据
 */
const props = defineProps<{
    order: Order
}>()

/**
 * 根据订单 status 返回对应的文字
 * 0: 待发货, 1: 已发货, 2: 已收货, 可按需扩展
 */
const statusText = computed(() => {
    switch (props.order.status) {
        case 0:
            return '待发货'
        case 1:
            return '已发货'
        case 2:
            return '已收货'
        default:
            return '未知状态'
    }
})

/**
 * 格式化订单创建时间
 */
const formattedCreatedAt = computed(() => {
    const date = new Date(props.order.createdAt)
    // 简单示例：yyyy-MM-dd HH:mm
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
