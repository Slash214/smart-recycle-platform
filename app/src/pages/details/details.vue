<template>
    <movable-area class="container">
        <movable-view
            class="movable-view"
            direction="all"
            :scale="true"
            :scale-min="1"
            :scale-max="5"
            :scale-value="1"
            @change="handleChange"
            @scale="handleScale"
        >
            <!-- 你的图片 -->

            <scroll-view scroll-y style="height: 100vh; width: 100vw">
                <view class="loading" v-if="loadingRef">
                    <wd-loading type="outline" />
                    <view class="text">数据正在加载中</view>
                </view>
                <view v-else>
                    <image
                        v-for="(item, idx) in imageUrls"
                        :key="`${item}-${idx}`"
                        lazy-load
                        :src="item"
                        class="preview-image"
                        mode="widthFix"
                    />
                </view>

                <EmptyState v-if="!loadingRef && !imageUrls.length" tip="报价还没有更新" />
            </scroll-view>
        </movable-view>
    </movable-area>
</template>

<script lang="ts" setup>
import { getBrandImages } from '@/apis'
import EmptyState from '@/components/EmptyState.vue'
import { BASE_IMAGE_URL } from '@/constant'
import { onLoad, onShareAppMessage } from '@dcloudio/uni-app'
import { ref } from 'vue'

const imageUrls = ref<string[]>([])
const loadingRef = ref(true)
const productId = ref<number | string>('')

// 监听拖拽事件
function handleChange(e: any) {
    console.log('拖拽位置改变：', e.detail)
}

// 监听缩放事件
function handleScale(e: any) {
    console.log('缩放倍数改变：', e.detail)
}

const getData = async (id: number) => {
    try {
        const data = await getBrandImages(id)
        imageUrls.value = (data?.imageUrls || []).map((item) =>
            item?.startsWith('http') ? item : `${BASE_IMAGE_URL}${item}`,
        )
    } catch (error) {
        console.log('请求失败', error)
    } finally {
        loadingRef.value = false
    }
}

// 页面 onLoad
onLoad((options) => {
    console.log('options', options)
    const id = options?.id || 0
    productId.value = id
    getData(Number(id))
})
</script>

<style scoped lang="scss">
.container {
    width: 100vw;
    height: 100vh;
}

.loading {
    width: 100%;
    background-color: #fff;
    height: 80vh;
    overflow: hidden;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    .text {
        color: #999;
        letter-spacing: 2px;
        font-weight: 700;
        font-size: 40rpx;
    }
}

.movable-view {
    width: 100vw;
    height: 100vh;
}

.preview-image {
    width: 100%;
}
</style>
