<template>
    <view class="page">
        <view class="card">
            <view class="title">申请退货</view>
            <view class="sub">请填写退货原因，提交后等待管理员审核</view>
            <view class="field">
                <view class="label required">退货原因</view>
                <textarea
                    v-model.trim="reason"
                    class="reason-input"
                    maxlength="500"
                    placeholder="请描述退货原因（至少2个字）"
                ></textarea>
                <view class="count">{{ reason.length }}/500</view>
            </view>
        </view>

        <view class="fix-bottom">
            <view class="submit-btn" @click="submit">提交申请</view>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { applyOrderReturn } from '@/apis'

const orderId = ref(0)
const reason = ref('')

onLoad((options) => {
    orderId.value = Number(options?.id || 0)
    if (!orderId.value) {
        uni.showToast({ title: '订单参数错误', icon: 'none' })
    }
})

async function submit() {
    if (!orderId.value) return
    const text = reason.value.trim()
    if (text.length < 2) {
        uni.showToast({ title: '请填写退货原因', icon: 'none' })
        return
    }
    try {
        uni.showLoading({ title: '提交中...', mask: true })
        await applyOrderReturn(orderId.value, { reason: text })
        uni.showToast({ title: '申请已提交', icon: 'none' })
        setTimeout(() => {
            uni.navigateBack()
        }, 300)
    } catch (err: any) {
        uni.showToast({ title: err?.message || '提交失败', icon: 'none' })
    } finally {
        uni.hideLoading()
    }
}
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
    border-radius: 18rpx;
    border: 1rpx solid $recycle-border-light;
    padding: 24rpx;
}

.title {
    font-size: 34rpx;
    font-weight: 600;
    color: $recycle-text;
}

.sub {
    margin-top: 10rpx;
    font-size: 24rpx;
    color: $recycle-muted;
}

.field {
    margin-top: 24rpx;
}

.label {
    font-size: 26rpx;
    color: $recycle-text-secondary;
    margin-bottom: 10rpx;
}

.required::before {
    content: '*';
    color: #ef4444;
    margin-right: 6rpx;
}

.reason-input {
    width: 100%;
    min-height: 220rpx;
    border: 1rpx solid $recycle-border;
    border-radius: 12rpx;
    background: #fff;
    padding: 16rpx;
    box-sizing: border-box;
    font-size: 28rpx;
    color: $recycle-text;
}

.count {
    margin-top: 10rpx;
    text-align: right;
    font-size: 22rpx;
    color: $recycle-muted;
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

.submit-btn {
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
</style>
