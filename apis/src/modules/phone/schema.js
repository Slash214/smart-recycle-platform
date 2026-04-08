const phoneBody = {
    type: 'object',
    required: ['name', 'brandId', 'price'],
    properties: {
        name: { type: 'string' },
        brandId: { type: 'integer' },
        price: { type: 'string' },
        cover: { type: 'string' },
        details: { type: 'string' },
        orderNum: { type: 'integer' },
        status: { type: 'integer' },
    },
}

module.exports = {
    listSchema: { tags: ['phone'], summary: '手机列表' },
    detailSchema: { tags: ['phone'], summary: '手机详情' },
    createSchema: { tags: ['phone'], summary: '创建手机', body: phoneBody },
    updateSchema: { tags: ['phone'], summary: '更新手机', body: phoneBody },
    deleteSchema: { tags: ['phone'], summary: '删除手机' },
}
