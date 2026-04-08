<template>
    <view class="empty-state">
        <image class="empty-image" :src="imageSrc" mode="aspectFit" />
        <view class="empty-text">{{ tip }}</view>
    </view>
</template>

<script lang="ts" setup>
import emptyImage from '@/static/empty.png'

withDefaults(
    defineProps<{
        tip?: string
        imageSrc?: string
    }>(),
    {
        tip: '暂无数据',
        imageSrc: emptyImage,
    },
)
</script>

<style scoped lang="scss">
.empty-state {
    padding: 80rpx 32rpx;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
}

.empty-image {
    width: 280rpx;
    height: 280rpx;
}

.empty-text {
    margin-top: 20rpx;
    font-size: 28rpx;
    color: #9a9a9a;
}
</style>
