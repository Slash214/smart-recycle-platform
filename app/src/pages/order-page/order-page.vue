<template>
    <view class="container">
        <view class="card address-card">
            <view class="address-main">
                <view class="address-title">寄件信息</view>
                <view class="line">
                    <text class="name">{{ addressItem.contactName || '未设置姓名' }}</text>
                    <text class="phone">{{ addressItem.phone || '未设置电话' }}</text>
                </view>
                <view class="line sub">{{ addressItem.addressName || '未设置门店地址' }}</view>
            </view>
            <view class="address-copy" @click="copyAddress">
                <wd-icon name="copy" size="15px" color="#2563eb"></wd-icon>
            </view>
        </view>

        <view class="card pay-card">
            <view class="pay-label">收款方式</view>
            <view class="pay-value-wrap">
                <text :class="['pay-text', payMethodText ? 'active' : '']">{{
                    payMethodText || '请选择收款方式'
                }}</text>
            </view>
        </view>

        <view class="card form-card">
            <view class="field">
                <view class="label required">快递公司</view>
                <view class="input-wrap picker" @click="chooseCourier">
                    <text :class="['placeholder', courierRef ? 'active' : '']">{{
                        courierRef || '请选择快递公司'
                    }}</text>
                    <wd-icon name="arrow-right" size="16px" color="#888"></wd-icon>
                </view>
            </view>

            <view class="field">
                <view class="label required">快递单号</view>
                <view class="input-wrap">
                    <input v-model="trackingNumberRef" class="native-input" placeholder="请输入快递单号" />
                    <wd-icon name="scan" size="18px" color="#888"></wd-icon>
                </view>
            </view>

            <view class="field">
                <view class="label required">货物数量</view>
                <view class="input-wrap">
                    <input
                        v-model="countRef"
                        class="native-input"
                        type="number"
                        placeholder="输入寄出的机器数量"
                    />
                </view>
            </view>

            <view class="field">
                <view class="label">备注信息</view>
                <view class="input-wrap">
                    <input
                        v-model="remarkRef"
                        class="native-input"
                        placeholder="实名+手机号(微信同号)"
                    />
                </view>
            </view>

            <view class="field no-margin">
                <view class="label">备注图片</view>
                <view class="upload-wrap">
                    <view class="upload-box" @click="chooseRemarkImage">
                        <image v-if="remarkImageRef" :src="remarkImageRef" class="upload-image" mode="aspectFill" />
                        <view v-else class="upload-placeholder">
                            <wd-icon name="camera" size="20px" color="#bdbdbd"></wd-icon>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>

    <wd-toast></wd-toast>
    <view class="fix-bottom">
        <view class="button" @click="onSubmit"> 提交发货 </view>
    </view>
</template>

<script lang="ts" setup>
import { computed, onUnmounted, ref } from 'vue'
import { createOrder, getMiniDefaultAddress, uploadImageFile } from '@/apis/index'
import { useToast } from 'wot-design-uni'
import { getStorage } from '@/utils/StorageUtils'
import { USER_KEY } from '@/constant'
import { onLoad } from '@dcloudio/uni-app'
import type { AddressItem } from '@/models'

const toast = useToast()
const payMethodList = [
    { label: '微信收款', value: 1 as const },
    { label: '支付宝收款', value: 2 as const },
    { label: '银行卡收款', value: 3 as const },
]
const courierList = ['顺丰快递', '京东快递', '中通快递', '圆通快递']

const payMethodRef = ref<1 | 2 | 3>(1)
const countRef = ref('')
const remarkRef = ref('')
const courierRef = ref('顺丰快递')
const trackingNumberRef = ref('')
const remarkImageRef = ref('')
const payMethodText = computed(() => {
    return payMethodList.find((item) => item.value === payMethodRef.value)?.label || ''
})

const addressItem = ref<AddressItem>({
    id: 0,
    contactName: '',
    addressName: '',
    phone: '',
})

const timer = ref<any>(null)

const choosePayMethod = () => {
    uni.showActionSheet({
        itemList: payMethodList.map((item) => item.label),
        success: (res) => {
            payMethodRef.value = payMethodList[res.tapIndex]?.value || payMethodRef.value
        },
    })
}

const chooseCourier = () => {
    uni.showActionSheet({
        itemList: courierList,
        success: (res) => {
            courierRef.value = courierList[res.tapIndex] || courierRef.value
        },
    })
}

const chooseRemarkImage = () => {
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: async (res) => {
            const filePath = res.tempFilePaths?.[0]
            if (!filePath) return

            uni.showLoading({
                title: '上传中...',
                mask: true,
            })
            try {
                const uploadData = await uploadImageFile(filePath)
                remarkImageRef.value = uploadData.url
                toast.success('图片上传成功')
            } catch (error: any) {
                toast.error(error?.message || '图片上传失败')
            } finally {
                uni.hideLoading()
            }
        },
    })
}

const onSubmit = async () => {
    if (!payMethodRef.value) {
        toast.warning('请选择收款方式')
        return
    }
    if (!courierRef.value) {
        toast.warning('请选择快递公司')
        return
    }
    if (!trackingNumberRef.value) {
        toast.warning('请填写快递单号')
        return
    }
    if (!countRef.value) {
        toast.warning('请输入货物数量')
        return
    }

    try {
        const user = getStorage<any>(USER_KEY)
        if (!user?.id) {
            toast.warning('用户未登录，请稍后再试')
            return
        }
        const contactPhone = user.mobile || user.phone || addressItem.value.phone
        if (!contactPhone) {
            toast.warning('请先完善联系电话')
            return
        }
        const cleanedRemarkImages = remarkImageRef.value
            ? [String(remarkImageRef.value).trim()].filter((item) => !!item)
            : []
        await createOrder({
            nums: Number(countRef.value),
            phone: String(contactPhone),
            type: 2,
            way: payMethodRef.value,
            tracking_number: String(trackingNumberRef.value).trim(),
            express_company: String(courierRef.value).trim(),
            remark: String(remarkRef.value || '').trim(),
            remark_images: cleanedRemarkImages,
            status: 1,
        })
        toast.success('下单成功')
        timer.value = setTimeout(() => {
            uni.navigateTo({
                url: '/pages/order-list/order-list?type=0',
            })
        }, 300)
    } catch (error) {
        console.log(error)
    }
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

onLoad(async () => {
    const data = await getMiniDefaultAddress()
    if (data) {
        addressItem.value = {
            id: data.id || 0,
            contactName: data.user || '',
            addressName: data.fullAddress || data.address || '',
            phone: data.mobile || '',
        }
    }
})

onUnmounted(() => {
    clearTimeout(timer.value)
})
</script>

<style scoped lang="scss">
.container {
    padding: 24rpx;
    padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
    background: #f3f6fb;
    min-height: 100vh;
}

.card {
    border-radius: 18rpx;
    padding: 24rpx;
    background-color: #fff;
    margin-bottom: 16rpx;
    border: 1px solid #e7edf6;
    box-shadow: 0 8rpx 20rpx rgba(15, 23, 42, 0.04);
}

.address-card {
    display: flex;
    align-items: flex-start;
    justify-content: space-between;
    .address-main {
        flex: 1;
        padding-right: 16rpx;
        .address-title {
            font-size: 22rpx;
            color: #94a3b8;
            margin-bottom: 8rpx;
            letter-spacing: 1rpx;
        }
        .line {
            font-size: 32rpx;
            color: #111827;
            line-height: 1.35;
            display: flex;
            align-items: baseline;
            .name {
                font-weight: 600;
                margin-right: 12rpx;
                max-width: 220rpx;
                overflow: hidden;
                text-overflow: ellipsis;
                white-space: nowrap;
            }
            .phone {
                color: #0f172a;
                font-size: 31rpx;
            }
        }
        .sub {
            color: #6b7280;
            margin-top: 8rpx;
            font-size: 30rpx;
            line-height: 1.4;
        }
    }
    .address-copy {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        border: 1px solid #cfe0ff;
        background: linear-gradient(180deg, #f8fbff 0%, #edf4ff 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        margin-top: 10rpx;
    }
}

.pay-card {
    padding-top: 18rpx;
    padding-bottom: 18rpx;
    .pay-label {
        font-size: 22rpx;
        color: #94a3b8;
        margin-bottom: 8rpx;
        letter-spacing: 1rpx;
    }
    .pay-value-wrap {
        min-height: 56rpx;
        border-radius: 12rpx;
        background: #f8fbff;
        border: 1px solid #dbe7ff;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18rpx;
    }
    .pay-text {
        font-size: 32rpx;
        font-weight: 600;
        color: #2563eb;
        letter-spacing: 0;
    }
    .active {
        color: #0f172a;
    }
}

.form-card {
    padding-top: 12rpx;
    .field {
        margin-bottom: 18rpx;
    }

    .no-margin {
        margin-bottom: 0;
    }

    .label {
        font-size: 25rpx;
        color: #6b7280;
        margin-bottom: 8rpx;
        position: relative;
        display: inline-block;
    }

    .required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 4rpx;
    }

    .input-wrap {
        min-height: 76rpx;
        border: 1px solid #dbe5f3;
        border-radius: 12rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
        transition: all 0.2s ease;
    }

    .picker {
        .placeholder {
            color: #9ca3af;
            font-size: 29rpx;
        }
        .active {
            color: #1f2937;
        }
    }

    .native-input {
        flex: 1;
        height: 76rpx;
        font-size: 29rpx;
        color: #111827;
    }

    .upload-wrap {
        border: 1px dashed #cfd9e8;
        border-radius: 12rpx;
        padding: 14rpx;
        background: #fafcff;
    }

    .upload-box {
        width: 120rpx;
        height: 120rpx;
        background: #f3f6fb;
        border-radius: 10rpx;
        overflow: hidden;
    }

    .upload-image,
    .upload-placeholder {
        width: 100%;
        height: 100%;
    }

    .upload-placeholder {
        display: flex;
        align-items: center;
        justify-content: center;
    }
}

.fix-bottom {
    background-color: rgba(255, 255, 255, 0.95);
    backdrop-filter: blur(8px);
    height: auto;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 14rpx 0 calc(14rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -6rpx 20rpx rgba(15, 23, 42, 0.08);
    .button {
        height: 80rpx;
        margin: 0 auto;
        width: calc(100% - 48rpx);
        border-radius: 14rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 32rpx;
        font-weight: 600;
        background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
        letter-spacing: 2rpx;
    }
}
</style>
