<template>
    <view class="custom-tabbar" :style="{ paddingBottom: safeAreaBottom + 'px' }">
        <!-- 首页 -->
        <view class="tab-item" @click="switchTab('/pages/index/index', 0)">
            <view class="icon-wrapper">
                <image
                    v-if="currentIndex === 0"
                    src="@/static/index-s.png"
                    mode="aspectFit"
                    class="icon"
                />
                <image v-else src="@/static/index.png" mode="aspectFit" class="icon" />
            </view>
            <text class="text" :class="{ active: currentIndex === 0 }">首页</text>
        </view>

        <!-- 中间凸起的发货下单按钮 -->
        <view class="center-button" @click="goToOrderPage">
            <view class="button-content">
                <text class="button-text-top">发货</text>
                <text class="button-text-bottom">下单</text>
            </view>
        </view>

        <!-- 我的 -->
        <view class="tab-item" @click="switchTab('/pages/my/my', 1)">
            <view class="icon-wrapper">
                <image
                    v-if="currentIndex === 1"
                    src="@/static/my-s.png"
                    mode="aspectFit"
                    class="icon"
                />
                <image v-else src="@/static/my.png" mode="aspectFit" class="icon" />
            </view>
            <text class="text" :class="{ active: currentIndex === 1 }">我的</text>
        </view>
    </view>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const currentIndex = ref(0)
const safeAreaBottom = ref(0)

// 获取安全区域底部高度
const getSafeAreaBottom = () => {
    const systemInfo = uni.getSystemInfoSync()
    // @ts-ignore
    safeAreaBottom.value = systemInfo.safeAreaInsets?.bottom || 0
}

// 切换 Tab
const switchTab = (url: string, index: number) => {
    if (currentIndex.value === index) {
        return
    }
    currentIndex.value = index
    
    // 使用 reLaunch 来切换页面，这样可以重置页面栈
    uni.reLaunch({
        url: url,
        fail: (err) => {
            console.error('页面跳转失败', err)
        },
    })
}

// 跳转到下单页面
const goToOrderPage = () => {
    uni.navigateTo({
        url: '/pages/order-page/order-page',
    })
}

// 根据当前页面路径设置选中状态
const setCurrentIndex = () => {
    const pages = getCurrentPages()
    if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        const route = currentPage.route

        if (route === 'pages/index/index') {
            currentIndex.value = 0
        } else if (route === 'pages/my/my') {
            currentIndex.value = 1
        }
    }
}

onMounted(() => {
    getSafeAreaBottom()
    setCurrentIndex()
})

onShow(() => {
    setCurrentIndex()
})
</script>

<style lang="scss" scoped>
@import '@/styles/recycle-ui.scss';
.custom-tabbar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 150rpx;
    background-color: $recycle-surface;
    display: flex;
    align-items: center;
    justify-content: space-around;
    border-top: 1rpx solid $recycle-border-light;
    z-index: 999;

    .tab-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100%;

        .icon-wrapper {
            width: 44rpx;
            height: 44rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 4rpx;

            .icon {
                width: 44rpx;
                height: 44rpx;
            }
        }

        .text {
            font-size: 22rpx;
            color: $recycle-muted;
            transition: color 0.3s;

            &.active {
                color: $recycle-accent;
            }
        }
    }

    .center-button {
        position: relative;
        width: 120rpx;
        height: 120rpx;
        margin-bottom: 50rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10;

        .button-content {
            width: 120rpx;
            height: 120rpx;
            background: $recycle-accent;
            border-radius: 50%;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            border: 2rpx solid $recycle-accent-dark;
            position: relative;
            z-index: 1;
            transition: transform 0.2s;

            &:active {
                transform: scale(0.95);
            }

            .button-text-top {
                font-size: 26rpx;
                color: #fff;
                font-weight: 600;
                line-height: 1.2;
                margin-bottom: 4rpx;
            }

            .button-text-bottom {
                font-size: 26rpx;
                color: #fff;
                font-weight: 600;
                line-height: 1.2;
            }
        }
    }
}
</style>

