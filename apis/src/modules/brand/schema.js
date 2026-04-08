module.exports = {
    listSchema: {
        tags: ['brand'],
        summary: '品牌列表（按一级类目筛选+分页）',
        querystring: {
            type: 'object',
            properties: {
                page: { type: 'integer', default: 1 },
                pageSize: { type: 'integer', default: 10 },
                ptypeId: { type: 'integer', description: '一级类目ID（ptype.id）' },
                status: { type: 'integer', description: '状态：1 正常，0 关闭' },
            },
        },
    },
    detailSchema: { tags: ['brand'], summary: '品牌详情' },
    detailListSchema: {
        tags: ['brand'],
        summary: '品牌详情分页列表',
        querystring: {
            type: 'object',
            properties: {
                page: { type: 'integer', default: 1 },
                pageSize: { type: 'integer', default: 10 },
                brandId: { type: 'integer' },
                status: { type: 'integer' },
            },
        },
    },
    createSchema: { tags: ['brand'], summary: '创建品牌' },
    updateSchema: { tags: ['brand'], summary: '更新品牌' },
    deleteSchema: { tags: ['brand'], summary: '删除品牌' },
}
