<template>
    <view class="page">
        <view class="title">{{ title }}</view>
        <view v-if="loading" class="loading">加载中...</view>
        <empty-state v-else-if="!content" tip="暂无内容"></empty-state>
        <view v-else class="content-wrap">
            <rich-text class="policy-rich-text" :nodes="content"></rich-text>
        </view>
    </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getMiniPolicy } from '@/apis'
import EmptyState from '@/components/EmptyState.vue'

const loading = ref(false)
const title = ref('用户协议')
const content = ref('')

onLoad(async (options) => {
    const type = options?.type === 'privacy' ? 'privacy' : 'agreement'
    title.value = type === 'privacy' ? '隐私政策' : '用户协议'
    uni.setNavigationBarTitle({ title: title.value })
    loading.value = true
    try {
        const data = await getMiniPolicy(type)
        content.value = data?.content || ''
    } finally {
        loading.value = false
    }
})
</script>

<style scoped lang="scss">
.page {
    min-height: 100vh;
    background: #f4f7fb;
    padding: 20rpx;
}

.title {
    font-size: 36rpx;
    font-weight: 600;
    color: #0f172a;
    margin-bottom: 16rpx;
}

.loading {
    text-align: center;
    color: #9ca3af;
    padding: 40rpx 0;
}

.content-wrap {
    background: #fff;
    border-radius: 16rpx;
    padding: 24rpx;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

/* rich-text 的内部标签样式通过 deep 方式覆盖 */
:deep(.policy-rich-text) {
    color: #1f2937;
    font-size: 30rpx;
    line-height: 1.75;
    word-break: break-word;
}

:deep(.policy-rich-text h1),
:deep(.policy-rich-text h2),
:deep(.policy-rich-text h3),
:deep(.policy-rich-text h4) {
    color: #0f172a;
    line-height: 1.4;
    margin: 20rpx 0 12rpx;
}

:deep(.policy-rich-text p) {
    margin: 10rpx 0;
}

:deep(.policy-rich-text ul),
:deep(.policy-rich-text ol) {
    padding-left: 34rpx;
    margin: 10rpx 0;
}

:deep(.policy-rich-text li) {
    margin: 6rpx 0;
}
</style>
