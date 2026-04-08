<template>
    <view class="container">
        <scroll-view class="tips" scroll-y>
            <!-- 条款一 -->
            <view class="section">
                <view class="section-title">一、发货前检查</view>
                <view class="section-content">
                    为了更好的做好服务，不浪费彼此时间，发货之前请看一下主板，如有主板严重压伤、进水、腐蚀、维修当环保机回收
                </view>
            </view>
            <!-- 条款二 -->
            <view class="section">
                <view class="section-title">二、报价与结算</view>
                <view class="section-content">
                    报价单仅供参考，实时更新，具体价格以到货当天市场出货价为准。
                    验机通过的正价机器将按实际出货价结算，请及时核对报价单，方便打款。
                    如售后机价格不合适，可包邮退回；发货前请仔细查看报价，觉得合适即可发货。
                </view>
            </view>
            <!-- 条款三 -->
            <view class="section">
                <view class="section-title">三、内爆机处理</view>
                <view class="section-content">
                    所有品牌内爆机和环保机需提供清单，方便核对，可一起打包发货，来货须预留好清单留箱，切记备注好具体型号台数，电话号码，来货清单跟机器屏幕上统一标注好数字编号，方便结算。
                </view>
            </view>
            <!-- 条款四 -->
            <view class="section">
                <view class="section-title">四、验机与物流</view>
                <view class="section-content">
                    所有来货排单验机，24小时出账单，过期再催。收货快递默认顺丰和京东，利润微薄，快递谁发谁付，退货我们付。
                </view>
            </view>
            <!-- 条款五 -->
            <view class="section">
                <view class="section-title">五、脏机与锁机</view>
                <view class="section-content"> 脏机、贼机勿扰，一旦发现后果自负！ </view>
            </view>
            <!-- 友情提示 -->
            <view class="section">
                <view class="section-title">友情提示</view>
                <view class="section-content">
                    报价单上未标注内存配置的机型，不区分高低配； 部分高档机型无屏或假屏需扣费；
                    部分机型高版本锁需扣费； 成色无要求，不扣费。
                </view>
            </view>
            <!-- 点数机要求 -->
            <view class="section">
                <view class="section-title">点数机要求</view>
                <view class="section-content">
                    主板无进水、无维修、无板压变形、断裂且配件齐全，无需测主板功能；
                    部分机型需测开机靓板。
                </view>
            </view>
            <!-- 常规机要求 -->
            <view class="section">
                <view class="section-title">常规机要求</view>
                <view class="section-content">
                    主板无进水、无维修、无板压变形、断裂；主板功能正常，不缺小件；
                    外壳成色、屏幕可不显示，均不扣框、不扣后盖、不扣锁。
                    有量有价，量大可商议加价回收，欢迎咨询合作。
                </view>
            </view>
        </scroll-view>
    </view>
</template>

<script lang="ts" setup>
import { onShareAppMessage } from '@dcloudio/uni-app'

// 分享给好友
// onShareAppMessage(() => {
//     return {
//         title: '发货需知 - 华强北魏冬报价网',
//         path: '/pages/tips/tips',
//     }
// })
</script>

<style scoped>
.container {
    padding: 20rpx;
    font-size: 30rpx;
    color: #222;

    width: 100vw;
}
.tips {
    border-radius: 20rpx;
    padding: 30rpx;
    font-size: 28rpx;
    color: #5d4037;
    line-height: 1.8;
}
.section {
    margin-bottom: 30rpx;
}
.section-title {
    font-weight: bold;
    font-size: 32rpx;
    margin-bottom: 10rpx;
}
.section-content {
    text-indent: 2em;
}
</style>
