const controller = require('./controller')
const schema = require('./schema')

async function orderRoutes(fastify) {
    fastify.get('/orders', { schema: schema.listSchema, preHandler: [fastify.authenticate] }, controller.list)
    fastify.get('/orders/:id', { schema: schema.detailSchema, preHandler: [fastify.authenticate] }, controller.detail)
    fastify.post('/orders', { schema: schema.createSchema, preHandler: [fastify.authenticate] }, controller.create)
    fastify.put('/orders/:id', { schema: schema.updateSchema, preHandler: [fastify.authenticate] }, controller.update)
    fastify.delete('/orders/:id', { schema: schema.deleteSchema, preHandler: [fastify.authenticate] }, controller.remove)
}

module.exports = orderRoutes
