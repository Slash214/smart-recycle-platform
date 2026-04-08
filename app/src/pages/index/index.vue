<template>
    <view class="nav"></view>
    <CustomNavBar title=""></CustomNavBar>
    <view class="container">
        <wd-swiper value-key="image_url" :list="swiperList" autoplay height="180px"></wd-swiper>

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
                <view
                    class="grid-item"
                    v-for="item in category.brands"
                    :key="item.id"
                    @click="gotoDetails(item)"
                >
                    <image class="cover" :src="item.logo" mode="widthFix" />
                    <view class="name">{{ item.brand }}</view>
                </view>
            </view>
        </view>

        <view class="block step">
            <view class="step-item" v-for="item in stepList" :key="item.id">
                <image :src="item.icon" mode="widthFix" />
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
                <image src="@/static/wechat.png" mode="widthFix" class="cover-image" />
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
import { BASE_IMAGE_URL, BRAND_NAME } from '@/constant'
import { useToast } from 'wot-design-uni'

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
        success: () => {},
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
    )

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
            phone: defaultAddress.mobile || '--',
        }
        wechatId.value = defaultAddress.wechat || wechatId.value
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
.reset-button {
    background-color: #fff;
    border: none;
    padding: 0;
    margin: 0;
    line-height: 1.4;
    display: flex;
    align-items: flex-start;
    color: #222;
    font-size: 30rpx;
    &::after {
        border: none;
    }
}
:deep(.custom-bar) {
    font-size: 16px !important;
}
.nav {
    background: linear-gradient(to bottom, #3e49ff, #f7f7f7);
    width: 100%;
    height: 200px;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
}

.container {
    padding: 32rpx;
    padding-bottom: 200rpx; // 为底部 tabbar 留出空间
    .block {
        background-color: #fff;
        border-radius: 8px;
        padding: 32rpx;
        margin-top: 20rpx;

        .brand-title {
            font-weight: 700;
            font-size: 38rpx;
            color: #1957ff;
            text-align: center;
            padding: 28rpx 0 36rpx 0;
            position: relative;
            margin-bottom: 12rpx;
            letter-spacing: 2rpx;
            text-shadow: 0 2rpx 8rpx rgba(25, 87, 255, 0.2);

            &::before,
            &::after {
                content: '';
                position: absolute;
                top: 50%;
                transform: translateY(-50%);
                width: 80rpx;
                height: 3rpx;
                background: linear-gradient(
                    90deg,
                    transparent 0%,
                    rgba(25, 87, 255, 0.3) 50%,
                    #1957ff 100%
                );
                border-radius: 2rpx;
            }

            &::before {
                left: 0;
            }

            &::after {
                right: 0;
                background: linear-gradient(
                    90deg,
                    #1957ff 0%,
                    rgba(25, 87, 255, 0.3) 50%,
                    transparent 100%
                );
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
            border: 1rpx solid #ddd;
            margin-right: 20rpx;
        }

        .active {
            background-color: rgba(25, 87, 255, 0.12);
            color: #1957ff;
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
                display: block;
                border-radius: 50%;
                margin-bottom: 8px;
            }
            .name {
                font-size: 24rpx;
                color: #222;
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
            image {
                width: 20px;
                margin-bottom: 5px;
            }
        }
    }

    .addressInfo {
        background-color: #1957ff;
        border-radius: 8px;
        overflow: hidden;
        padding: 0;
        margin-top: 20rpx;

        .header {
            background-color: #1957ff;
            color: #fff;
            text-align: center;
            padding: 24rpx 32rpx;
            font-size: 30rpx;
            font-weight: 500;
        }

        .body {
            background-color: #fff;
            padding: 32rpx;
            margin: 0 auto 16rpx auto;
            width: 96%;
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
                color: #222;
                margin-left: 16rpx;
                margin-right: 16rpx;
                word-break: break-all;

                &.address-text {
                    color: #222;
                    line-height: 1.5;
                }
            }

            .action-btn {
                background-color: #1957ff;
                color: #fff;
                padding: 12rpx 32rpx;
                border-radius: 8rpx;
                font-size: 26rpx;
                white-space: nowrap;
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
                margin-right: 20rpx;
            }

            .cover {
                background-color: #1957ff;
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
</style>
