<template>
    <view class="container">
        <view class="card address-card">
            <view class="address-main">
                <view class="line">{{ addressItem.contactName }}{{ addressItem.phone }}</view>
                <view class="line sub">{{ addressItem.addressName }}</view>
            </view>
            <view class="address-copy" @click="copyAddress">
                <wd-icon name="copy" size="18px" color="#888"></wd-icon>
            </view>
        </view>

        <view class="card pay-card" @click="choosePayMethod">
            <text :class="['pay-text', payMethodRef ? 'active' : '']">{{
                payMethodRef || '请选择收款方式'
            }}</text>
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
import { onUnmounted, ref } from 'vue'
import { createOrder, getMiniDefaultAddress, uploadImageFile } from '@/apis/index'
import { useToast } from 'wot-design-uni'
import { getStorage } from '@/utils/StorageUtils'
import { USER_KEY } from '@/constant'
import { onLoad } from '@dcloudio/uni-app'
import type { AddressItem } from '@/models'

const toast = useToast()
const payMethodList = ['微信收款', '支付宝收款', '银行卡收款']
const courierList = ['顺丰快递', '京东快递', '中通快递', '圆通快递']

const payMethodRef = ref('微信收款')
const countRef = ref('')
const remarkRef = ref('')
const courierRef = ref('顺丰快递')
const trackingNumberRef = ref('')
const remarkImageRef = ref('')

const addressItem = ref<AddressItem>({
    id: 0,
    contactName: '',
    addressName: '',
    phone: '',
})

const timer = ref<any>(null)

const choosePayMethod = () => {
    uni.showActionSheet({
        itemList: payMethodList,
        success: (res) => {
            payMethodRef.value = payMethodList[res.tapIndex] || payMethodRef.value
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
        await createOrder({
            nums: Number(countRef.value),
            phone: contactPhone,
            type: 2,
            way: payMethodRef.value,
            tracking_number: trackingNumberRef.value,
            express_company: courierRef.value,
            remark: remarkRef.value,
            remark_images: remarkImageRef.value ? [remarkImageRef.value] : [],
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
    padding: 32rpx;
    padding-bottom: calc(120rpx + env(safe-area-inset-bottom));
    background: #f5f6f8;
    min-height: 100vh;
}

.card {
    border-radius: 18rpx;
    padding: 26rpx 30rpx;
    background-color: #fff;
    margin-bottom: 20rpx;
    box-shadow: 0 6rpx 18rpx rgba(17, 24, 39, 0.04);
}

.address-card {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .address-main {
        flex: 1;
        .line {
            font-size: 30rpx;
            color: #222;
            line-height: 1.6;
        }
        .sub {
            color: #666;
        }
    }
    .address-copy {
        width: 52rpx;
        display: flex;
        justify-content: center;
        align-items: center;
    }
}

.pay-card {
    text-align: center;
    .pay-text {
        font-size: 40rpx;
        font-weight: 600;
        color: #1f63ff;
    }
    .active {
        color: #222;
    }
}

.form-card {
    padding-top: 20rpx;
    .field {
        margin-bottom: 22rpx;
    }

    .no-margin {
        margin-bottom: 0;
    }

    .label {
        font-size: 26rpx;
        color: #666;
        margin-bottom: 10rpx;
        position: relative;
        display: inline-block;
    }

    .required::before {
        content: '*';
        color: #ff4d4f;
        margin-right: 4rpx;
    }

    .input-wrap {
        min-height: 68rpx;
        border: 1px solid #d9dee8;
        border-radius: 14rpx;
        padding: 0 20rpx;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: #fff;
    }

    .picker {
        .placeholder {
            color: #999;
            font-size: 30rpx;
        }
        .active {
            color: #222;
        }
    }

    .native-input {
        flex: 1;
        height: 68rpx;
        font-size: 30rpx;
        color: #222;
    }

    .upload-wrap {
        border: 1px solid #d8d8d8;
        border-radius: 14rpx;
        padding: 16rpx;
    }

    .upload-box {
        width: 120rpx;
        height: 120rpx;
        background: #f5f5f5;
        border-radius: 8rpx;
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
    background-color: #fff;
    height: auto;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 12rpx 0 calc(12rpx + env(safe-area-inset-bottom));
    box-shadow: 0 -2px 8px rgba(0, 0, 0, 0.06);
    .button {
        height: 72rpx;
        margin: 0 auto;
        width: calc(100% - 64rpx);
        border-radius: 12rpx;
        display: flex;
        align-items: center;
        justify-content: center;
        color: #fff;
        font-size: 34rpx;
        font-weight: 600;
        background: linear-gradient(90deg, #2f5fe9 0%, #3f74ff 100%);
    }
}
</style>
