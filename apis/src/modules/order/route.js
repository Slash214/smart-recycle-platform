const controller = require('./controller')
const schema = require('./schema')

async function orderRoutes(fastify) {
    fastify.get('/orders', { schema: schema.listSchema, preHandler: [fastify.authenticate] }, controller.list)
    fastify.get('/orders/:id', { schema: schema.detailSchema, preHandler: [fastify.authenticate] }, controller.detail)
    fastify.post('/orders', { schema: schema.createSchema, preHandler: [fastify.authenticate] }, controller.create)
    fastify.put('/orders/:id', { schema: schema.updateSchema, preHandler: [fastify.authenticate] }, controller.update)
    fastify.delete('/orders/:id', { schema: schema.deleteSchema, preHandler: [fastify.authenticate] }, controller.remove)
    fastify.post('/orders/:id/return-apply', { schema: schema.applyReturnSchema, preHandler: [fastify.authenticate] }, controller.applyReturn)
    fastify.get('/orders/:id/return-latest', { schema: schema.latestReturnSchema, preHandler: [fastify.authenticate] }, controller.latestReturn)
    fastify.get('/orders/returns', { schema: schema.listReturnsSchema, preHandler: [fastify.authenticate] }, controller.listReturns)
    fastify.put('/orders/returns/:id/audit', { schema: schema.auditReturnSchema, preHandler: [fastify.authenticate] }, controller.auditReturn)
}

module.exports = orderRoutes
