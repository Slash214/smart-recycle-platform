const { ok, fail, toPaginationMeta } = require('../../common/response')
const {
    exchangeWechatCode,
    getOrCreateMiniUser,
    listMiniBanners,
    listMiniCategories,
    getMiniDefaultAddress,
    listTypeWithBrandsForMini,
    getMiniBrandDetailImages,
} = require('./service')

async function silentLogin(request, reply) {
    const { code } = request.body || {}
    if (!code) {
        return reply.code(400).send(fail(40001, 'code 必填'))
    }

    try {
        const { openid, session_key } = await exchangeWechatCode(code)
        const user = await getOrCreateMiniUser({ openid, session_key })
        const token = await reply.jwtSign({
            uid: user.id,
            openid: user.openid,
            role: 'user',
            platform: 'WECHAT',
        })

        return ok({
            token,
            user: {
                id: user.id,
                openid: user.openid,
                userName: user.userName,
                avatar: user.avatar,
                mobile: user.mobile,
                platform: user.platform,
            },
        }, '静默登录成功')
    } catch (error) {
        return reply.code(400).send(fail(40004, error.message || '静默登录失败'))
    }
}

async function banners(request) {
    const result = await listMiniBanners(request.query || {})
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function categories(request) {
    const data = await listMiniCategories(request.query || {})
    return ok(data, 'ok')
}

async function defaultAddress() {
    const store = await getMiniDefaultAddress()
    return ok(
        store || null,
        store ? 'ok' : '暂无可用门店地址'
    )
}

async function typeBrands(request) {
    const data = await listTypeWithBrandsForMini(request.query || {})
    return ok(data, 'ok')
}

async function brandDetailImages(request, reply) {
    const brandId = parseInt(request.params.id, 10)
    if (!brandId) {
        return reply.code(400).send(fail(40001, 'brandId 无效'))
    }
    const data = await getMiniBrandDetailImages(brandId)
    return ok(data, 'ok')
}

module.exports = {
    silentLogin,
    banners,
    categories,
    defaultAddress,
    typeBrands,
    brandDetailImages,
}
