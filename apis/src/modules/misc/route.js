const { ok, toPaginationMeta } = require('../../common/response')
const { Address, Banner, Help, listByModel, crud } = require('./service')

function registerCrud(fastify, resource, Model, authWrite = true) {
    fastify.get(`/${resource}`, { tags: [resource] }, async (request) => {
        const result = await listByModel(Model, request.query)
        return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
    })

    fastify.get(`/${resource}/:id`, { tags: [resource] }, async (request) => {
        return ok(await Model.findByPk(request.params.id))
    })

    const createOpt = authWrite ? { preHandler: [fastify.authenticate], tags: [resource] } : { tags: [resource] }
    fastify.post(`/${resource}`, createOpt, async (request) => ok(await crud(Model, null, request.body), '创建成功'))
    fastify.put(`/${resource}/:id`, { preHandler: [fastify.authenticate], tags: [resource] }, async (request) =>
        ok(await crud(Model, request.params.id, request.body), '更新成功')
    )
    fastify.delete(`/${resource}/:id`, { preHandler: [fastify.authenticate], tags: [resource] }, async (request) => {
        await crud(Model, request.params.id, null)
        return ok(true, '删除成功')
    })
}

async function miscRoutes(fastify) {
    registerCrud(fastify, 'addresses', Address)
    registerCrud(fastify, 'banners', Banner)
    registerCrud(fastify, 'helps', Help)
}

module.exports = miscRoutes
