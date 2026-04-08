module.exports = {
    listSchema: {
        tags: ['order'],
        summary: '订单列表（管理端/小程序）',
        querystring: {
            type: 'object',
            properties: {
                page: { type: 'integer', default: 1 },
                pageSize: { type: 'integer', default: 20 },
                userid: { type: 'string' },
                type: { type: 'integer', description: '1上门 2邮寄' },
                way: { type: 'integer', description: '收货方式' },
                status: { type: 'integer', description: '1待确认 2进行中 3已完成' },
                keyword: { type: 'string', description: '手机号/单号/快递公司/备注 关键词' },
                startAt: { type: 'string', description: '创建时间开始（ISO）' },
                endAt: { type: 'string', description: '创建时间结束（ISO）' },
            },
        },
    },
    detailSchema: {
        tags: ['order'],
        summary: '订单详情',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'integer' },
            },
        },
    },
    createSchema: {
        tags: ['order'],
        summary: '创建订单',
        body: {
            type: 'object',
            required: ['nums', 'phone'],
            properties: {
                nums: { type: 'integer', minimum: 1 },
                price: { type: 'string' },
                phone: { type: 'string' },
                remark: { type: 'string' },
                way: { type: 'integer', description: '1上门 2邮寄' },
                userid: { type: 'string', description: '管理员代下单可传；小程序端自动取token' },
                type: { type: 'integer', description: '1上门 2邮寄' },
                visit_time: { type: 'string' },
                tracking_number: { type: 'string' },
                express_company: { type: 'string', description: '快递公司名称（字符串）' },
                areas: { type: 'string' },
                hourse_number: { type: 'string' },
                status: { type: 'integer', description: '1待确认 2进行中 3已完成；默认1' },
                remark_images: {
                    oneOf: [
                        { type: 'array', items: { type: 'string' } },
                        { type: 'string' },
                    ],
                    description: '备注图片URL数组',
                },
            },
        },
    },
    updateSchema: {
        tags: ['order'],
        summary: '更新订单',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'integer' },
            },
        },
        body: {
            type: 'object',
            properties: {
                nums: { type: 'integer', minimum: 1 },
                price: { type: 'string' },
                phone: { type: 'string' },
                remark: { type: 'string' },
                way: { type: 'integer' },
                type: { type: 'integer' },
                visit_time: { type: 'string' },
                tracking_number: { type: 'string' },
                express_company: { type: 'string' },
                areas: { type: 'string' },
                hourse_number: { type: 'string' },
                status: { type: 'integer', description: '1待确认 2进行中 3已完成' },
                remark_images: {
                    oneOf: [
                        { type: 'array', items: { type: 'string' } },
                        { type: 'string' },
                    ],
                },
            },
        },
    },
    deleteSchema: {
        tags: ['order'],
        summary: '删除订单（软删）',
        params: {
            type: 'object',
            required: ['id'],
            properties: {
                id: { type: 'integer' },
            },
        },
    },
}
