<template>
    <view class="nav"></view>
    <CustomNavBar title=""></CustomNavBar>
    <view class="container">
        <view class="banner-wrap">
            <wd-swiper v-if="swiperReady && swiperList.length" value-key="image_url" :list="swiperList"
                :autoplay="swiperList.length > 1" height="180px"></wd-swiper>
            <view v-else class="banner-skeleton"></view>
        </view>

        <view class="block addressInfo">
            <view class="header">离您最近的门店【{{ BRAND_NAME }}】</view>

            <view class="body">
                <!-- 电话行 -->
                <view class="info-row">
                    <wd-icon name="call" size="22px" color="#222"></wd-icon>
                    <view class="info-text">电话: {{ addressItem.phone }}</view>
                    <view class="action-btn" @click="callUser">拨号</view>
                </view>

                <!-- 微信行 -->
                <view class="info-row">
                    <wd-icon name="chat" size="22px" color="#222"></wd-icon>
                    <view class="info-text">微信: {{ wechatId }}</view>
                    <view class="action-btn" @click="copyWechat">复制</view>
                </view>

                <!-- 地址行 -->
                <view class="info-row">
                    <wd-icon name="location" size="22px" color="#222"></wd-icon>
                    <view class="info-text address-text">{{ addressItem.addressName }}</view>
                    <view class="action-btn" @click="navigateToAddress">导航</view>
                </view>
            </view>
        </view>

        <view class="block" v-for="category in categoryList" :key="category.id">
            <view class="brand-title">{{ category.typeName }}</view>
            <view class="grid">
                <view class="grid-item" v-for="item in category.brands" :key="item.id" @click="gotoDetails(item)">
                    <image class="cover" :src="item.logo" mode="aspectFit" />
                    <view class="name">{{ item.brand }}</view>
                </view>
            </view>
        </view>

        <view class="block step">
            <view class="step-item" v-for="item in stepList" :key="item.id">
                <image :src="item.icon" mode="aspectFit" />
                <view>{{ item.name }}</view>
            </view>
        </view>

        <view class="block bottom">
            <view class="item" @click="callUser">
                <view class="cover">
                    <wd-icon name="call" color="#fff" size="22px"></wd-icon>
                </view>

                <view class="content">
                    <wd-text bold color="#111" text="电话咨询"></wd-text>
                    <view class="mt5"></view>
                    <wd-text size="24rpx" color="#666" text="点击拨打"></wd-text>
                </view>
            </view>
            <view class="item">
                <image src="@/static/wechat.png" mode="aspectFit" class="cover-image" />
                <button class="content reset-button" open-type="contact">
                    <wd-text bold color="#111" text="微信客服"></wd-text>
                    <view class="mt5"></view>
                    <wd-text size="24rpx" color="#999" text="点击查看"></wd-text>
                </button>
            </view>
        </view>
    </view>

    <button open-type="share" v-show="false"></button>
    <wd-toast></wd-toast>
    <CustomTabBar />
</template>

<script setup lang="ts">
import CustomNavBar from '@/components/CustomNavBar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { onLoad, onShareAppMessage, onShow } from '@dcloudio/uni-app'
import { ref } from 'vue'
import { getMiniBanners, getMiniTypeBrands, getMiniDefaultAddress } from '@/apis/index'
import { BASE_IMAGE_URL, BRAND_NAME, SITE_CONFIG_KEY } from '@/constant'
import { useToast } from 'wot-design-uni'
import { getStorage } from '@/utils/StorageUtils'

interface Product {
    id: number
    logo?: string
    brand?: string
    ptypeId?: number
    [key: string]: any
}

interface CategoryItem {
    id: number
    typeName: string
    brands: Product[]
    [key: string]: any
}

interface SwiperItem {
    image_url: string
    [key: string]: any
}

const toast = useToast()

const tabMenu = [
    { id: 1, name: '回收报价表' },
    { id: 2, name: '发货需知' },
    // { id: 3, name: '热门机型' },
]
const tabIdRef = ref(1)

const categoryList = ref<CategoryItem[]>([])

const stepList = ref([
    { id: 1, name: '查看报价', icon: '/static/step-1.png' },
    { id: 2, name: '寄件下单', icon: '/static/step-2.png' },
    { id: 3, name: '签收质检', icon: '/static/step-3.png' },
    { id: 4, name: '快速回收', icon: '/static/step-4.png' },
])

const addressItem = ref({
    contactName: '默认',
    addressName: '默认地址',
    phone: '13556888981',
})

const wechatId = ref('-W061209')
const swiperList = ref<SwiperItem[]>([])
const swiperReady = ref(false)

const handleClick = () => {
    uni.navigateTo({
        url: '/pages/order-page/order-page',
    })
}

const handleClickTab = (item: any) => {
    // console.log(item)
    tabIdRef.value = item.id
}

const gotoDetails = (item: any) => {
    const id = item.id
    uni.navigateTo({
        url: `/pages/details/details?id=${id}`,
    })
}

const copyAddress = () => {
    uni.setClipboardData({
        data: addressItem.value.addressName,
        success: () => {
            // toast.success('复制成功')
        },
        fail: (err) => {
            console.error('复制失败', err)
            // toast.error('复制失败')
        },
    })
}

const copyWechat = () => {
    uni.setClipboardData({
        data: wechatId.value,
        success: () => { },
        fail: (err) => {
            console.error('复制失败', err)
            toast.error('复制失败')
        },
    })
}

const navigateToAddress = () => {
    // 复制地址到剪贴板，提示用户在地图应用中搜索
    if (addressItem.value.addressName) {
        uni.setClipboardData({
            data: addressItem.value.addressName,
            success: () => {
                // toast.success('地址已复制，请在地图应用中搜索')
            },
            fail: (err) => {
                console.error('复制失败', err)
                toast.error('复制失败')
            },
        })
    }
}

const callUser = () => {
    uni.makePhoneCall({
        phoneNumber: addressItem.value.phone || '13556888981',
        success: (res) => {
            console.log('res', res)
        },
        fail: (err) => {
            console.log('err', err)
        },
    })
}

const initData = async () => {
    const siteConfig = getStorage<{ servicePhone?: string; contactWechat?: string }>(SITE_CONFIG_KEY)
    if (siteConfig?.servicePhone) {
        addressItem.value.phone = siteConfig.servicePhone
    }
    if (siteConfig?.contactWechat) {
        wechatId.value = siteConfig.contactWechat
    }

    const [defaultAddress, bannerRes, typeBrandsRes] = await Promise.all([
        getMiniDefaultAddress(),
        getMiniBanners({ page: 1, pageSize: 10 }),
        getMiniTypeBrands(),
    ])

    const banners = bannerRes || []
    swiperList.value = banners.map(
        (item: { image_url?: string; imageUrl?: string; imgUrl?: string }) => {
            const image = item.image_url || item.imageUrl || item.imgUrl || ''
            return {
                ...item,
                image_url: image.startsWith('http') ? image : `${BASE_IMAGE_URL}${image}`,
            }
        },
    ).filter((item: SwiperItem) => !!item.image_url)
    swiperReady.value = true

    const categories = typeBrandsRes?.categories || []
    categoryList.value = categories.map((category: CategoryItem) => ({
        ...category,
        brands: (category.brands || []).map((brand: Product) => ({
            ...brand,
            logo: brand.logo?.startsWith('http')
                ? brand.logo
                : `${BASE_IMAGE_URL}${brand.logo || ''}`,
        })),
    }))

    if (defaultAddress) {
        addressItem.value = {
            contactName: defaultAddress.user || '--',
            addressName: defaultAddress.fullAddress || defaultAddress.address || '--',
            phone: siteConfig?.servicePhone || defaultAddress.mobile || '--',
        }
        wechatId.value = siteConfig?.contactWechat || defaultAddress.wechat || wechatId.value
    }
}

onShow(() => {
    initData()
})

// 分享给好友
onShareAppMessage(() => {
    return {
        title: `${BRAND_NAME} - 专业手机回收报价平台`,
        path: '/pages/index/index',
    }
})
</script>

<style lang="scss" scoped>
@import '@/styles/recycle-ui.scss';
.reset-button {
    background-color: $recycle-surface;
    border: none;
    padding: 0;
    margin: 0;
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    color: $recycle-text;
    font-size: 30rpx;

    &::after {
        border: none;
    }
}

:deep(.custom-bar) {
    font-size: 16px !important;
}

.nav {
    background: linear-gradient(180deg, #3f6bff 0%, #6b7cff 44%, #eef2ff 100%);
    width: 100%;
    height: 200px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
}

.container {
    padding: 24rpx;
    padding-bottom: 200rpx; // 为底部 tabbar 留出空间

    .banner-wrap {
        height: 180px;
    }

    .banner-skeleton {
        width: 100%;
        height: 180px;
        border-radius: 16rpx;
        background: linear-gradient(90deg, #f2f4ff 25%, #e8ecff 50%, #f2f4ff 75%);
        background-size: 200% 100%;
        animation: skeleton-loading 1.2s linear infinite;
    }

    .block {
        background-color: $recycle-surface;
        border-radius: 20rpx;
        padding: 32rpx;
        margin-top: 20rpx;
        border: 1rpx solid $recycle-border-light;

        .brand-title {
            font-weight: 700;
            font-size: 36rpx;
            color: $recycle-accent-dark;
            text-align: center;
            padding: 22rpx 0 30rpx 0;
            position: relative;
            margin-bottom: 8rpx;
            letter-spacing: 1rpx;
            text-shadow: none;

            &::before,
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 80rpx;
                height: 2rpx;
                background: linear-gradient(90deg,
                        transparent 0%,
                        rgba(47, 125, 74, 0.26) 50%,
                        $recycle-accent 100%);
                border-radius: 2rpx;
            }

            &::before {
                left: 0;
            }

            &::after {
                right: 0;
                background: linear-gradient(90deg,
                        $recycle-accent 0%,
                        rgba(47, 125, 74, 0.26) 50%,
                        transparent 100%);
            }
        }
    }

    .tab {
        display: flex;
        align-items: center;
        justify-content: flex-start;
        margin-bottom: 20px;

        .tab-item {
            width: 100px;
            height: 40px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 4px;
            border: 1rpx solid $recycle-border;
            margin-right: 20rpx;
        }

        .active {
            background-color: $recycle-accent-soft;
            color: $recycle-accent-dark;
        }
    }

    .grid {
        padding: 10rpx 0;
        display: grid;
        grid-template-columns: repeat(4, 1fr);
        grid-template-rows: 1fr;
        grid-column-gap: 15px;
        grid-row-gap: 15px;

        .grid-item {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;

            .cover {
                width: 45px;
                height: 45px;
                display: block;
                border-radius: 50%;
                margin-bottom: 8px;
            }

            .name {
                font-size: 24rpx;
                color: $recycle-text;
                height: 30px;
                text-align: center;
            }
        }
    }

    .step {
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 40rpx 48rpx;

        .step-item {
            display: flex;
            align-items: center;
            flex-direction: column;
            font-size: 24rpx;
            color: $recycle-text-secondary;

            image {
                width: 20px;
                height: 20px;
                margin-bottom: 5px;
            }
        }
    }

    .addressInfo {
        background: $recycle-accent-soft;
        border-radius: 20rpx;
        overflow: hidden;
        padding: 0;
        margin-top: 20rpx;
        border: 1rpx solid $recycle-accent-muted;

        .header {
            background-color: transparent;
            color: $recycle-accent-dark;
            text-align: center;
            padding: 24rpx 32rpx;
            font-size: 29rpx;
            font-weight: 600;
        }

        .body {
            background-color: $recycle-surface;
            padding: 32rpx;
            margin: 0 14rpx 14rpx 14rpx;
            border-radius: 14rpx;
            border: 1rpx solid $recycle-border-light;
        }

        .info-row {
            display: flex;
            align-items: center;
            margin-bottom: 32rpx;

            &:last-child {
                margin-bottom: 0;
            }

            .wechat-icon {
                width: 22px;
                height: 22px;
            }

            .info-text {
                flex: 1;
                font-size: 28rpx;
                color: $recycle-text;
                margin-left: 16rpx;
                margin-right: 16rpx;
                word-break: break-all;

                &.address-text {
                    color: $recycle-text;
                    line-height: 1.5;
                }
            }

            .action-btn {
                background: $recycle-accent;
                color: #fff;
                padding: 10rpx 28rpx;
                border-radius: 10rpx;
                font-size: 24rpx;
                font-weight: 600;
                white-space: nowrap;
                border: 1rpx solid $recycle-accent-dark;
            }
        }
    }

    .bottom {
        display: grid;
        grid-template-columns: repeat(2, 1fr);
        grid-template-rows: 1fr;
        grid-column-gap: 0px;
        grid-row-gap: 0px;

        .item {
            display: flex;
            align-items: center;
            justify-content: center;

            .cover-image {
                width: 30px;
                height: 30px;
                margin-right: 20rpx;
            }

            .cover {
                background: $recycle-accent;
                border-radius: 50%;
                width: 30px;
                height: 30px;
                overflow: hidden;
                display: flex;
                align-items: center;
                justify-content: center;
                margin-right: 20rpx;
            }

            .content {
                display: flex;
                flex-direction: column;
                line-height: 1.5;
            }
        }
    }
}

@keyframes skeleton-loading {
    0% {
        background-position: 200% 0;
    }

    100% {
        background-position: -200% 0;
    }
}
</style>
