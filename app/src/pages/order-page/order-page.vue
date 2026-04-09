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
            <view class="pay-value-wrap" @click="choosePayMethod">
                <text :class="['pay-text', payMethodText ? 'active' : '']">{{
                    payMethodText || '请选择收款方式'
                }}</text>
                <wd-icon name="arrow-right" size="16px" color="#888"></wd-icon>
            </view>
        </view>

        <view class="card pay-card">
            <view class="pay-label">收款信息</view>
            <view v-if="payMethodRef === 1" class="field no-margin">
                <view class="label required">微信收款账号</view>
                <view class="input-wrap">
                    <input v-model.trim="wechatAccountRef" class="native-input" placeholder="请输入微信号或绑定手机号" />
                </view>
            </view>
            <view v-else-if="payMethodRef === 2" class="field no-margin">
                <view class="label required">支付宝账号</view>
                <view class="input-wrap">
                    <input v-model.trim="alipayAccountRef" class="native-input" placeholder="请输入支付宝账号" />
                </view>
            </view>
            <view v-else class="bank-fields">
                <view class="field">
                    <view class="label required">收款人姓名</view>
                    <view class="input-wrap">
                        <input v-model.trim="payeeNameRef" class="native-input" placeholder="请输入持卡人姓名" />
                    </view>
                </view>
                <view class="field">
                    <view class="label required">开户行</view>
                    <view class="input-wrap">
                        <input v-model.trim="bankNameRef" class="native-input" placeholder="请输入银行名称" />
                    </view>
                </view>
                <view class="field no-margin">
                    <view class="label required">银行卡号</view>
                    <view class="input-wrap">
                        <input v-model.trim="bankCardNoRef" class="native-input" type="number" placeholder="请输入银行卡号" />
                    </view>
                </view>
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

            <view class="field device-block">
                <view class="label required">回收明细</view>
                <text class="hint">填写机型、内存、整机或单板与数量；价格由仓库收货后填写</text>
                <view
                    v-for="(line, index) in deviceLines"
                    :key="line.id"
                    class="device-card"
                >
                    <view class="device-card-head">
                        <text class="device-index">第 {{ index + 1 }} 条</text>
                        <text
                            v-if="deviceLines.length > 1"
                            class="device-remove"
                            @click="removeDeviceLine(index)"
                        >
                            删除
                        </text>
                    </view>
                    <view class="device-grid">
                        <view class="device-cell">
                            <text class="sub-label">机型</text>
                            <input
                                v-model="line.model"
                                class="device-input"
                                placeholder="如：苹果"
                            />
                        </view>
                        <view class="device-cell">
                            <text class="sub-label">内存</text>
                            <input
                                v-model="line.memory"
                                class="device-input"
                                placeholder="如：8G"
                            />
                        </view>
                        <view class="device-cell">
                            <text class="sub-label">类型</text>
                            <view class="device-input picker-like" @click="chooseUnitType(index)">
                                <text :class="['picker-txt', line.unitType ? 'on' : '']">
                                    {{ unitTypeLabel(line.unitType) }}
                                </text>
                                <wd-icon name="arrow-right" size="14px" color="#888"></wd-icon>
                            </view>
                        </view>
                        <view class="device-cell">
                            <text class="sub-label">数量</text>
                            <input
                                v-model="line.qty"
                                class="device-input"
                                type="number"
                                placeholder="数量"
                            />
                        </view>
                    </view>
                </view>
                <view class="add-row" @click="addDeviceLine">
                    <text class="add-plus">+</text>
                    <text class="add-txt">添加一条</text>
                </view>
                <view v-if="totalDeviceQty > 0" class="total-qty">
                    合计数量：<text class="num">{{ totalDeviceQty }}</text> 件
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

/** 回收明细一行：机型 + 内存 + 整机/单板 + 数量（价格后台填，此处不传） */
interface DeviceLine {
    id: string
    model: string
    memory: string
    unitType: 'whole' | 'board' | ''
    qty: string
}

function createDeviceLine(): DeviceLine {
    return {
        id: `${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        model: '',
        memory: '',
        unitType: 'whole',
        qty: '',
    }
}

const payMethodRef = ref<1 | 2 | 3>(1)
const payeeNameRef = ref('')
const wechatAccountRef = ref('')
const alipayAccountRef = ref('')
const bankNameRef = ref('')
const bankCardNoRef = ref('')
const deviceLines = ref<DeviceLine[]>([createDeviceLine()])
const remarkRef = ref('')
const courierRef = ref('顺丰快递')
const trackingNumberRef = ref('')
const remarkImageRef = ref('')
const payMethodText = computed(() => {
    return payMethodList.find((item) => item.value === payMethodRef.value)?.label || ''
})

const totalDeviceQty = computed(() => {
    return deviceLines.value.reduce((sum, line) => {
        const n = parseInt(String(line.qty || '').trim(), 10)
        return sum + (Number.isFinite(n) && n > 0 ? n : 0)
    }, 0)
})

function unitTypeLabel(u: DeviceLine['unitType']) {
    if (u === 'board') return '单板'
    if (u === 'whole') return '整机'
    return '请选择'
}

function addDeviceLine() {
    deviceLines.value.push(createDeviceLine())
}

function removeDeviceLine(index: number) {
    if (deviceLines.value.length <= 1) return
    deviceLines.value.splice(index, 1)
}

function chooseUnitType(index: number) {
    uni.showActionSheet({
        itemList: ['整机', '单板'],
        success: (res) => {
            const line = deviceLines.value[index]
            if (!line) return
            line.unitType = res.tapIndex === 1 ? 'board' : 'whole'
        },
    })
}

function validateDeviceLines(): string | null {
    for (let i = 0; i < deviceLines.value.length; i++) {
        const l = deviceLines.value[i]
        const row = i + 1
        if (!l.model.trim()) return `请填写第 ${row} 条的机型`
        if (!l.memory.trim()) return `请填写第 ${row} 条的内存`
        if (!l.unitType) return `请选择第 ${row} 条的整机/单板`
        const q = parseInt(String(l.qty).trim(), 10)
        if (!Number.isFinite(q) || q < 1) return `请填写第 ${row} 条的合法数量`
    }
    return null
}

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
    if (payMethodRef.value === 1 && !wechatAccountRef.value.trim()) {
        toast.warning('请填写微信收款账号')
        return
    }
    if (payMethodRef.value === 2 && !alipayAccountRef.value.trim()) {
        toast.warning('请填写支付宝账号')
        return
    }
    if (payMethodRef.value === 3) {
        if (!payeeNameRef.value.trim()) {
            toast.warning('请填写收款人姓名')
            return
        }
        if (!bankNameRef.value.trim()) {
            toast.warning('请填写开户行')
            return
        }
        if (!bankCardNoRef.value.trim()) {
            toast.warning('请填写银行卡号')
            return
        }
    }
    const lineErr = validateDeviceLines()
    if (lineErr) {
        toast.warning(lineErr)
        return
    }
    if (totalDeviceQty.value < 1) {
        toast.warning('请至少填写一条回收明细的数量')
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
            nums: totalDeviceQty.value,
            phone: String(contactPhone),
            type: 2,
            way: payMethodRef.value,
            payee_name: payeeNameRef.value.trim(),
            wechat_account: wechatAccountRef.value.trim(),
            alipay_account: alipayAccountRef.value.trim(),
            bank_name: bankNameRef.value.trim(),
            bank_card_no: bankCardNoRef.value.trim(),
            tracking_number: String(trackingNumberRef.value).trim(),
            express_company: String(courierRef.value).trim(),
            remark: String(remarkRef.value || '').trim(),
            devices: deviceLines.value.map((l) => ({
                model: l.model.trim(),
                memory: l.memory.trim(),
                unit: l.unitType === 'board' ? ('board' as const) : ('whole' as const),
                qty: parseInt(String(l.qty).trim(), 10) || 0,
            })),
            remark_images: cleanedRemarkImages,
            status: 10,
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
@import '@/styles/recycle-ui.scss';

.container {
    padding: 24rpx;
    padding-bottom: calc(130rpx + env(safe-area-inset-bottom));
    background: $recycle-bg;
    min-height: 100vh;
}

.card {
    border-radius: 18rpx;
    padding: 24rpx;
    background-color: $recycle-surface;
    margin-bottom: 16rpx;
    border: 1rpx solid $recycle-border-light;
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
        border: 1rpx solid $recycle-accent-muted;
        background: $recycle-accent-soft;
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
        background: $recycle-accent-soft;
        border: 1rpx solid $recycle-accent-muted;
        display: flex;
        align-items: center;
        justify-content: space-between;
        padding: 0 18rpx;
    }
    .pay-text {
        font-size: 32rpx;
        font-weight: 600;
        color: $recycle-accent;
        letter-spacing: 0;
    }
    .active {
        color: #0f172a;
    }

    .bank-fields .field {
        margin-bottom: 14rpx;
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
        border: 1rpx solid $recycle-border;
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
        border: 1rpx dashed $recycle-border;
        border-radius: 12rpx;
        padding: 14rpx;
        background: $recycle-warm;
    }

    .upload-box {
        width: 120rpx;
        height: 120rpx;
        background: $recycle-bg;
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

    .device-block {
        .hint {
            display: block;
            font-size: 22rpx;
            color: $recycle-muted;
            line-height: 1.45;
            margin-bottom: 16rpx;
        }
    }

    .device-card {
        border: 1rpx solid $recycle-border-light;
        border-radius: 14rpx;
        padding: 20rpx;
        margin-bottom: 16rpx;
        background: $recycle-warm;
    }

    .device-card-head {
        display: flex;
        align-items: center;
        justify-content: space-between;
        margin-bottom: 16rpx;
    }

    .device-index {
        font-size: 26rpx;
        font-weight: 600;
        color: $recycle-text;
    }

    .device-remove {
        font-size: 24rpx;
        color: #ef4444;
        padding: 8rpx 12rpx;
    }

    .device-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 16rpx 20rpx;
    }

    .device-cell {
        min-width: 0;
    }

    .sub-label {
        display: block;
        font-size: 22rpx;
        color: $recycle-text-secondary;
        margin-bottom: 8rpx;
    }

    .device-input {
        width: 100%;
        height: 72rpx;
        padding: 0 16rpx;
        box-sizing: border-box;
        border: 1rpx solid $recycle-border;
        border-radius: 10rpx;
        font-size: 28rpx;
        color: $recycle-text;
        background: $recycle-surface;
    }

    .picker-like {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }

    .picker-txt {
        font-size: 28rpx;
        color: #9ca3af;
        flex: 1;
        &.on {
            color: $recycle-text;
        }
    }

    .add-row {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 8rpx;
        padding: 22rpx;
        border-radius: 12rpx;
        border: 1rpx dashed $recycle-accent-muted;
        background: $recycle-surface;
        margin-top: 4rpx;
    }

    .add-plus {
        font-size: 40rpx;
        font-weight: 300;
        color: $recycle-accent;
        line-height: 1;
    }

    .add-txt {
        font-size: 28rpx;
        color: $recycle-accent-dark;
        font-weight: 500;
    }

    .total-qty {
        margin-top: 16rpx;
        font-size: 26rpx;
        color: $recycle-text-secondary;
        text-align: right;
        .num {
            color: $recycle-accent;
            font-weight: 700;
        }
    }
}

.fix-bottom {
    background-color: rgba(255, 255, 255, 0.98);
    height: auto;
    width: 100%;
    position: fixed;
    bottom: 0;
    left: 0;
    padding: 14rpx 0 calc(14rpx + env(safe-area-inset-bottom));
    border-top: 1rpx solid $recycle-border-light;
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
        background: $recycle-accent;
        border: 1rpx solid $recycle-accent-dark;
        letter-spacing: 2rpx;
    }
}
</style>
