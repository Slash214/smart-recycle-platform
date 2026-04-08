const controller = require('./controller')
const schema = require('./schema')

async function phoneRoutes(fastify) {
    fastify.get('/phones', { schema: schema.listSchema }, controller.list)
    fastify.get('/phones/:id', { schema: schema.detailSchema }, controller.detail)
    fastify.post('/phones', { schema: schema.createSchema, preHandler: [fastify.authenticate] }, controller.create)
    fastify.put('/phones/:id', { schema: schema.updateSchema, preHandler: [fastify.authenticate] }, controller.update)
    fastify.delete('/phones/:id', { schema: schema.deleteSchema, preHandler: [fastify.authenticate] }, controller.remove)
}

module.exports = phoneRoutes
