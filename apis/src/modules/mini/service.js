const axios = require('axios')
const { User, Banner, Ptype, Brand, Address, Details } = require('../../../db/models')
const { Wechat } = require('../../../conf/wechat')
const typeBrandsCache = new Map()

async function exchangeWechatCode(code) {
    if (!Wechat.AppID || !Wechat.AppSecret) {
        throw new Error('微信配置缺失，请检查 WECHAT_APP_ID / WECHAT_APP_SECRET')
    }

    const url = 'https://api.weixin.qq.com/sns/jscode2session'
    const response = await axios.get(url, {
        params: {
            appid: Wechat.AppID,
            secret: Wechat.AppSecret,
            js_code: code,
            grant_type: 'authorization_code',
        },
    })

    const { openid, session_key, errmsg } = response.data || {}
    if (!openid || errmsg) {
        throw new Error(errmsg || 'code 无效或微信登录失败')
    }
    return { openid, session_key }
}

async function getOrCreateMiniUser({ openid, session_key }) {
    let user = await User.findOne({ where: { openid } })
    if (!user) {
        const count = await User.count()
        user = await User.create({
            openid,
            userName: `用户${count + 10000}`,
            mobile: '',
            platform: 'WECHAT',
            session_key,
            status: 1,
        })
    } else if (session_key && user.session_key !== session_key) {
        await User.update({ session_key }, { where: { id: user.id } })
        user = await User.findByPk(user.id)
    }
    return user
}

async function listMiniBanners({ page = 1, pageSize = 10 }) {
    const p = Math.max(parseInt(page, 10) || 1, 1)
    const ps = Math.max(parseInt(pageSize, 10) || 10, 1)
    const result = await Banner.findAndCountAll({
        where: { status: 1 },
        order: [['id', 'desc']],
        limit: ps,
        offset: (p - 1) * ps,
    })
    return { rows: result.rows, total: result.count, page: p, pageSize: ps }
}

async function listMiniCategories({ ptypeId }) {
    const selectedPtypeId = parseInt(ptypeId, 10) || 0

    const [types, brands] = await Promise.all([
        Ptype.findAll({
            where: { status: 1 },
            order: [['orderNo', 'asc'], ['id', 'asc']],
        }),
        Brand.findAll({
            where: selectedPtypeId > 0 ? { status: 1, ptypeId: selectedPtypeId } : { status: 1 },
            order: [['orderNum', 'desc'], ['id', 'desc']],
        }),
    ])

    return { types, brands }
}

async function getMiniDefaultAddress() {
    let store = await Address.findOne({
        where: { status: 1, defaultAddress: 1 },
        order: [['id', 'desc']],
    })

    if (!store) {
        store = await Address.findOne({
            where: { status: 1 },
            order: [['id', 'desc']],
        })
    }

    return store
}

async function listTypeWithBrandsForMini({ ptypeId }) {
    const selectedPtypeId = parseInt(ptypeId, 10) || 0
    const cacheKey = `mini:typeBrands:${selectedPtypeId || 'all'}`
    const cache = typeBrandsCache.get(cacheKey)
    const now = Date.now()
    if (cache && cache.expireAt > now) {
        return cache.data
    }

    const types = await Ptype.findAll({
        where: { status: 1 },
        attributes: ['id', 'typeName', 'orderNo'],
        order: [['orderNo', 'asc'], ['id', 'asc']],
        raw: true,
    })

    const where = selectedPtypeId > 0 ? { status: 1, ptypeId: selectedPtypeId } : { status: 1 }
    const brands = await Brand.findAll({
        where,
        attributes: ['id', 'brand', 'logo', 'ptypeId', 'orderNum', 'updateinfo'],
        order: [['orderNum', 'desc'], ['id', 'desc']],
        raw: true,
    })

    const grouped = {}
    for (const item of brands) {
        const key = item.ptypeId
        if (!grouped[key]) grouped[key] = []
        grouped[key].push(item)
    }

    const categories = types.map((t) => ({
        id: t.id,
        typeName: t.typeName,
        orderNo: t.orderNo,
        brands: grouped[t.id] || [],
    }))

    const data = {
        selectedPtypeId,
        categories,
    }
    typeBrandsCache.set(cacheKey, {
        expireAt: now + 60 * 1000,
        data,
    })
    return data
}

function parseImageUrls(value) {
    if (!value) return []
    if (Array.isArray(value)) return value
    if (typeof value === 'string') {
        try {
            const parsed = JSON.parse(value)
            return Array.isArray(parsed) ? parsed : []
        } catch (e) {
            return []
        }
    }
    return []
}

async function getMiniBrandDetailImages(brandId) {
    const detail = await Details.findOne({
        where: { brandId, status: 1 },
        order: [['id', 'desc']],
    })
    if (!detail) {
        return {
            brandId,
            imageUrls: [],
        }
    }
    const data = detail.toJSON ? detail.toJSON() : detail
    return {
        brandId,
        imageUrls: parseImageUrls(data.imageUrls),
    }
}

module.exports = {
    exchangeWechatCode,
    getOrCreateMiniUser,
    listMiniBanners,
    listMiniCategories,
    getMiniDefaultAddress,
    listTypeWithBrandsForMini,
    getMiniBrandDetailImages,
}
