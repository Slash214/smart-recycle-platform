<template>
    <view class="page">
        <view class="card">
            <view class="row" @click="showPolicy('agreement')">
                <text class="label">用户协议</text>
                <wd-icon name="arrow-right" size="18px" color="#c7d2e3"></wd-icon>
            </view>
            <view class="row" @click="showPolicy('privacy')">
                <text class="label">隐私政策</text>
                <wd-icon name="arrow-right" size="18px" color="#c7d2e3"></wd-icon>
            </view>
        </view>
    </view>
</template>

<script lang="ts" setup>
const showPolicy = (type: 'agreement' | 'privacy') => {
    uni.navigateTo({
        url: `/pages/policy/policy?type=${type}`,
    })
}
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: #f4f7fb;
    padding: 22rpx;
}

.card {
    background: #fff;
    border-radius: 18rpx;
    border: 1px solid #e7edf6;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
    overflow: hidden;
}

.row {
    min-height: 96rpx;
    padding: 0 24rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid #eef3fb;

    &:last-child {
        border-bottom: none;
    }
}

.label {
    font-size: 34rpx;
    color: #0f172a;
}
</style>
