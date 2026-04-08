<script setup lang="ts">
import { onLaunch, onShow, onHide, onShareAppMessage } from '@dcloudio/uni-app'
import { setStorage } from '@/utils/StorageUtils'
import { USER_KEY, TOKEN_KEY, BRAND_NAME, SITE_CONFIG_KEY } from '@/constant'
import { silentLogin, getMiniSiteConfig } from '@/apis'

onLaunch(() => {
    getMiniSiteConfig()
        .then((config) => {
            setStorage(SITE_CONFIG_KEY, config)
        })
        .catch(() => {
            // 忽略配置拉取错误，页面使用默认值兜底
        })

    uni.login({
        success: async (res) => {
            if (!res.code) {
                console.log('静默登录失败：未获取到 code')
                return
            }
            try {
                const data = await silentLogin({
                    code: res.code,
                })
                setStorage(TOKEN_KEY, data.token)
                setStorage(USER_KEY, data.user)
            } catch (error) {
                console.log('静默登录失败', error)
            }
        },
        fail: (err) => {
            console.log('uni.login 失败', err)
        },
    })
})


onShareAppMessage(() => {
    return {
        title: `${BRAND_NAME} - 专业手机回收报价平台`,
        path: '/pages/index/index',
    }
})

onShow(() => {
    getMiniSiteConfig()
        .then((config) => {
            setStorage(SITE_CONFIG_KEY, config)
        })
        .catch(() => {
            // 忽略配置拉取错误，页面使用缓存兜底
        })
})
onHide(() => {
    console.log('App Hide')
})
</script>
<style></style>
