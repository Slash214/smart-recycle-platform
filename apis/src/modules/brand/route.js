const controller = require('./controller')
const schema = require('./schema')

async function brandRoutes(fastify) {
    fastify.get('/brands', { schema: schema.listSchema }, controller.list)
    fastify.get('/brands/:id', { schema: schema.detailSchema }, controller.detail)
    fastify.post('/brands', { schema: schema.createSchema, preHandler: [fastify.authenticate] }, controller.create)
    fastify.put('/brands/:id', { schema: schema.updateSchema, preHandler: [fastify.authenticate] }, controller.update)
    fastify.delete('/brands/:id', { schema: schema.deleteSchema, preHandler: [fastify.authenticate] }, controller.remove)

    fastify.get('/brands/:id/details', { tags: ['brand'] }, controller.getDetails)
    fastify.get('/brand-details', { schema: schema.detailListSchema }, controller.listDetails)
    fastify.put('/brands/:id/details', { tags: ['brand'], preHandler: [fastify.authenticate] }, controller.putDetails)

    fastify.get('/types', { tags: ['brand'] }, controller.listTypes)
    fastify.post('/types', { tags: ['brand'], preHandler: [fastify.authenticate] }, controller.createType)
    fastify.put('/types/:id', { tags: ['brand'], preHandler: [fastify.authenticate] }, controller.updateType)
    fastify.delete('/types/:id', { tags: ['brand'], preHandler: [fastify.authenticate] }, controller.removeType)

    fastify.post('/brands/viewed', { tags: ['brand'], preHandler: [fastify.authenticate] }, controller.userViewed)
}

module.exports = brandRoutes
