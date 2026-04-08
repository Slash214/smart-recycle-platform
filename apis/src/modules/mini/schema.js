module.exports = {
    silentLoginSchema: {
        tags: ['mini'],
        summary: '小程序静默登录（code 换 openid）',
        body: {
            type: 'object',
            required: ['code'],
            properties: {
                code: { type: 'string', description: 'wx.login 获取的 code' },
            },
        },
    },
    bannersSchema: {
        tags: ['mini'],
        summary: '小程序轮播图',
        querystring: {
            type: 'object',
            properties: {
                page: { type: 'integer', default: 1 },
                pageSize: { type: 'integer', default: 10 },
            },
        },
    },
    categoriesSchema: {
        tags: ['mini'],
        summary: '小程序首页类目与品牌',
        querystring: {
            type: 'object',
            properties: {
                ptypeId: { type: 'integer', description: '一级类目ID（ptype.id）' },
            },
        },
    },
    defaultAddressSchema: {
        tags: ['mini'],
        summary: '小程序默认门店地址（优先 defaultAddress=1）',
    },
    typeBrandsSchema: {
        tags: ['mini'],
        summary: '小程序产品类型+品牌（已排序，直接渲染）',
        querystring: {
            type: 'object',
            properties: {
                ptypeId: { type: 'integer', description: '可选，一级类目ID（ptype.id）' },
            },
        },
    },
    brandDetailImagesSchema: {
        tags: ['mini'],
        summary: '小程序获取品牌详情图片数组',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'integer', description: '品牌ID' },
            },
        },
    },
    policySchema: {
        tags: ['mini'],
        summary: '小程序获取用户协议/隐私政策',
        querystring: {
            type: 'object',
            properties: {
                type: { type: 'string', enum: ['agreement', 'privacy'], default: 'agreement' },
            },
        },
    },
    siteConfigSchema: {
        tags: ['mini'],
        summary: '小程序获取全局站点配置（客服电话/微信）',
    },
}
