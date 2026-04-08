<template>
    <view class="nav"></view>
    <CustomNavBar title=""></CustomNavBar>

    <view class="container">
        <view class="profile-card">
            <button class="avatar-button" @click="chooseAvatar" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
                <image :src="avatarUrl || defaultAvatar" mode="aspectFill" class="avatar" @error="handleAvatarError" />
            </button>

            <view class="profile-content">
                <template v-if="isLoggedIn">
                    <view class="nickname">{{ displayName }}</view>
                </template>
                <button class="login-button" v-else open-type="getPhoneNumber" @getphonenumber="onGetPhoneNumber">
                    点击登录
                </button>
            </view>
        </view>

        <view class="order-card">
            <view class="order-title">出货订单</view>
            <view class="order-status-list">
                <view class="status-item" v-for="item in orderMenus" :key="item.id" @click="handleClick(item.type)">
                    <view class="icon-circle">
                        <wd-icon :name="item.icon" size="34rpx" color="#2563eb"></wd-icon>
                    </view>
                    <text class="status-text">{{ item.name }}</text>
                </view>
            </view>
        </view>

        <view class="menu-list">
            <view class="menu-item" v-for="item in panelMenus" :key="item.id" @click="handlePanelClick(item)">
                <view class="left">
                    <view class="menu-icon">
                        <wd-icon :name="item.icon" size="28rpx" color="#2563eb"></wd-icon>
                    </view>
                    <view class="menu-text">{{ item.name }}</view>
                </view>
                <wd-icon name="arrow-right" size="26rpx" color="#c8c8c8"></wd-icon>
            </view>
        </view>
    </view>

    <CustomTabBar />
</template>

<script lang="ts" setup>
import CustomNavBar from '@/components/CustomNavBar.vue'
import CustomTabBar from '@/components/CustomTabBar.vue'
import { BRAND_NAME, SITE_CONFIG_KEY, USER_KEY } from '@/constant'
import { getStorage, setStorage } from '@/utils/StorageUtils'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { computed, ref } from 'vue'
import { getTel, updateUser } from '@/apis'
import { useToast } from 'wot-design-uni'
import defaultAvatar from '@/static/default.webp'
const toast = useToast()
const userInfo = ref<any>({})
const avatarUrl = ref<string>('')
// const defaultAvatar = '@/static/default.webp'

const idName = computed(() => {
    const str = userInfo.value.openid
    return str?.slice(-5).toUpperCase()
})

const isLoggedIn = computed(() => {
    return Boolean(userInfo.value?.id || userInfo.value?.openid)
})

const displayName = computed(() => {
    // const userName = userInfo.value?.userName || userInfo.value?.username
    // if (userName) return userName
    // if (userInfo.value?.mobile) return userInfo.value.mobile
    return `${BRAND_NAME}用户`
})

const orderMenus = ref([
    { id: 1, name: '待入库', icon: 'clock', type: 0 },
    { id: 2, name: '待结算', icon: 'refresh1', type: 1 },
    { id: 3, name: '已结算', icon: 'check-circle', type: 2 },
    { id: 4, name: '我的订单', icon: 'list', type: 0 },
])

const panelMenus = ref([
    { id: 1, name: '联系我们', icon: 'service', action: 'contact' },
    { id: 2, name: '设置', icon: 'setting', action: 'setting' },
])

const handleClick = (type: number) => {
    uni.navigateTo({
        url: `/pages/order-list/order-list?type=${type}`,
    })
}

const handlePanelClick = (item: { action?: string }) => {
    if (item.action === 'setting') {
        uni.navigateTo({ url: '/pages/setting/setting' })
        return
    }
    if (item.action === 'contact') {
        const siteConfig = getStorage<{ servicePhone?: string }>(SITE_CONFIG_KEY)
        const phone = siteConfig?.servicePhone || userInfo.value?.mobile || '13556888981'
        uni.makePhoneCall({ phoneNumber: String(phone) })
        return
    }
}

const onGetPhoneNumber = async (e: any) => {
    console.log('getPhoneNumber e.detail: ', e.detail)
    // 若用户点击“允许”，则 e.detail 中会包含 encryptedData、iv
    if (e.detail.encryptedData && e.detail.iv) {
        // 防止 MySQL "Truncated incorrect INTEGER value: 'undefined'" 错误
        // 原因：userInfo.value.id 可能为 undefined（如用户进入页面时 createUser 尚未完成）
        const userId = userInfo.value?.id
        if (userId == null) {
            toast.error('用户信息加载中，请稍后再试')
            return
        }
        const code = e.detail.code
        if (!code) {
            toast.error('获取手机号失败，请重试')
            return
        }
        const { data } = await getTel({ code })
        console.log('data', data)
        const tel = data.phone_info.phoneNumber
        // 获取的手机号
        const user = await updateUser(userId, {
            phone: tel,
            username: userInfo.value.username,
        })

        userInfo.value = user
        setStorage(USER_KEY, user)
        console.log(user)
    }
}

// 选择头像（当 open-type="chooseAvatar" 不可用时使用）
const chooseAvatar = (e?: any) => {
    // 如果是在小程序中且使用了 chooseAvatar，这个函数可能不会被调用
    // 但为了兼容性，我们仍然提供选择图片的功能
    uni.chooseImage({
        count: 1,
        sizeType: ['compressed'],
        sourceType: ['album', 'camera'],
        success: (res) => {
            const tempFilePath = res.tempFilePaths[0]
            // 上传头像到服务器（这里先保存本地路径，实际应该上传到服务器）
            avatarUrl.value = tempFilePath
            // 保存到用户信息
            if (userInfo.value.id) {
                updateUserAvatar(tempFilePath)
            } else {
                // 如果用户未登录，先保存到本地
                const user = getStorage(USER_KEY)
                if (user) {
                    user.avatar = tempFilePath
                    setStorage(USER_KEY, user)
                    userInfo.value = user
                }
            }
        },
        fail: (err) => {
            console.error('选择图片失败', err)
            // 不显示错误提示，因为可能是用户取消了
        },
    })
}

// 微信小程序选择头像
const onChooseAvatar = (e: any) => {
    const { avatarUrl: wxAvatarUrl } = e.detail
    if (wxAvatarUrl) {
        avatarUrl.value = wxAvatarUrl
        // 保存到用户信息
        if (userInfo.value.id) {
            updateUserAvatar(wxAvatarUrl)
        } else {
            // 如果用户未登录，先保存到本地
            const user = getStorage(USER_KEY)
            if (user) {
                user.avatar = wxAvatarUrl
                setStorage(USER_KEY, user)
                userInfo.value = user
            }
        }
    }
}

// 更新用户头像
const updateUserAvatar = async (avatar: string) => {
    try {
        // 这里应该上传图片到服务器，获取服务器返回的URL
        // 暂时先保存本地路径
        const user = await updateUser(userInfo.value.id, {
            avatar: avatar,
            phone: userInfo.value.phone,
            username: userInfo.value.username,
        })
        userInfo.value = user
        setStorage(USER_KEY, user)
        toast.success('头像更新成功')
    } catch (error) {
        console.error('更新头像失败', error)
        toast.error('更新头像失败')
    }
}

// 头像加载失败处理
const handleAvatarError = () => {
    avatarUrl.value = ''
}

const loadUserInfo = () => {
    const user = getStorage(USER_KEY)
    console.log('用户', user)
    userInfo.value = user || {}
    if (user?.avatar) {
        avatarUrl.value = user.avatar
    }
}



onShow(() => {
    // 每次显示页面时刷新用户信息，避免 createUser 尚未完成时 id 为空
    loadUserInfo()
})

// // 分享给好友
// onShareAppMessage(() => {
//     return {
//         title: '华强北魏冬报价网 - 专业手机回收报价平台',
//         path: '/pages/index/index',
//     }
// })
</script>

<style scoped lang="scss">
.nav {
    background: linear-gradient(180deg, #2563eb 0%, #3b82f6 58%, #f3f6fb 100%);
    width: 100%;
    height: 420rpx;
    position: fixed;
    top: 0;
    left: 0;
    z-index: -1;
}

.container {
    padding: 24rpx;
    padding-bottom: 220rpx;

    .profile-card {
        display: flex;
        align-items: center;
        padding: 34rpx 4rpx 30rpx;

        .avatar-button {
            padding: 0;
            margin: 0;
            background: none;
            border: none;

            &::after {
                border: none;
            }
        }

        .avatar {
            width: 104rpx;
            height: 104rpx;
            border-radius: 24rpx;
            background-color: rgba(255, 255, 255, 0.95);
            border: 2px solid rgba(255, 255, 255, 0.8);
            box-shadow: 0 10rpx 24rpx rgba(15, 23, 42, 0.2);
        }

        .profile-content {
            flex: 1;
            margin-left: 24rpx;
            color: #fff;

            .nickname {
                font-size: 42rpx;
                font-weight: 600;
                letter-spacing: 1rpx;
                text-shadow: 0 2rpx 8rpx rgba(15, 23, 42, 0.2);
            }
        }
    }

    .login-button {
        padding: 0;
        margin: 0;
        background: transparent;
        color: #fff;
        font-size: 32rpx;
        line-height: 1.4;

        &::after {
            border: none;
        }
    }

    .order-card {
        background-color: #fff;
        border-radius: 20rpx;
        padding: 22rpx 18rpx;
        margin-top: 24rpx;
        display: flex;
        align-items: center;
        border: 1px solid #e7edf6;
        box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.05);

        .order-title {
            width: 120rpx;
            font-weight: 700;
            font-size: 46rpx;
            color: #0f172a;
            line-height: 1.2;
            padding-left: 10rpx;
            border-right: 1px solid #edf2fa;
        }

        .order-status-list {
            flex: 1;
            padding-left: 16rpx;
            display: flex;
            justify-content: space-around;

            .status-item {
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: flex-start;

                .icon-circle {
                    width: 64rpx;
                    height: 64rpx;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    margin-bottom: 10rpx;
                    border: 1px solid #d8e4fb;
                    background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
                    border-radius: 50%;
                    box-shadow: 0 4rpx 12rpx rgba(37, 99, 235, 0.12);
                }

                .status-text {
                    font-size: 28rpx;
                    color: #334155;
                }
            }
        }
    }

    .menu-list {
        background: #fff;
        border-radius: 20rpx;
        margin-top: 20rpx;
        overflow: hidden;
        border: 1px solid #e7edf6;
        box-shadow: 0 8rpx 22rpx rgba(15, 23, 42, 0.05);

        .menu-item {
            min-height: 96rpx;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 24rpx;
            border-bottom: 1px solid #eef3fb;

            &:last-child {
                border-bottom: none;
            }

            .left {
                display: flex;
                align-items: center;
                gap: 18rpx;
            }

            .menu-icon {
                width: 52rpx;
                height: 52rpx;
                border-radius: 14rpx;
                border: 1px solid #d8e4fb;
                background: linear-gradient(180deg, #f8fbff 0%, #eef4ff 100%);
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .menu-text {
                font-size: 32rpx;
                color: #0f172a;
            }
        }
    }
}
</style>
