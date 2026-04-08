<template>
    <wd-tabs v-model="curTypeId" @click="handleClick">
        <block v-for="item in tabList" :key="item.id">
            <wd-tab :title="item.name"> </wd-tab>
        </block>
    </wd-tabs>
    <view class="container">
        <order-card v-for="item in list" :key="item.id" :order="item"></order-card>
        <wd-status-tip v-if="!list.length" image="content" tip="暂无内容" />
    </view>
</template>

<script lang="ts" setup>
import { onLoad } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getOrderList } from '@/apis'
import OrderCard from '@/components/OrderCard.vue'

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
const list = ref<Order[]>([])

const curTypeId = ref(0)
const tabList = ref([
    { id: 0, name: '全部' },
    { id: 1, name: '已发货' },
    { id: 2, name: '已收货' },
])

const reqParams = ref({
    page: 1,
    pageSize: 20,
    status: undefined as undefined | 1 | 2 | 3,
})



const handleClick = (e: any) => {
    const current = Number(e?.name ?? curTypeId.value ?? 0)
    reqParams.value.status = current === 0 ? undefined : (current as 1 | 2 | 3)

    initData()
}


const initData = async () => {
    const data = await getOrderList(reqParams.value)
    list.value = (data?.list || data?.data || []) as Order[]
    console.log(data)
}

onLoad((options) => {
    const current = Number(options?.type || 0)
    reqParams.value.status = current === 0 ? undefined : (current as 1 | 2 | 3)

    initData()
})
</script>

<style scoped lang="scss">
.container {
    padding: 32rpx;
    min-height: 100vh;
    background-color: #f5f5f5;
    padding-bottom: 200rpx; // 为底部 tabbar 留出空间
}
</style>
