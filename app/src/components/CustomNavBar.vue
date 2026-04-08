<template>
    <wd-navbar
        left-arrow
        :placeholder="placeholder"
        safeAreaInsetTop
        :bordered="bordered"
        :custom-style="'background-color: ' + bgColor + '!important;'"
    >
        <template #left>
            <template v-if="showBack">
                <wd-icon @click="onBack" name="thin-arrow-left" size="32rpx" color="#222"></wd-icon>
            </template>
            <slot v-else name="left"></slot>
        </template>

        <template #title>
            <view class="title">{{ title }}</view>
            <slot name="right"></slot>
        </template>
    </wd-navbar>
</template>

<script setup lang="ts">
defineProps({
    bordered: {
        type: Boolean,
        default: false,
    },
    title: {
        type: String,
        default: '',
    },
    bgColor: {
        type: String,
        default: 'transparent',
    },
    placeholder: {
        type: Boolean,
        default: true,
    },
    showBack: {
        type: Boolean,
        default: false,
    },
})

const onBack = () => {
    uni.navigateBack()
}
</script>

<style scoped lang="scss">

.title {
    font-weight: 500;
    font-size: 28rpx;
}
</style>
