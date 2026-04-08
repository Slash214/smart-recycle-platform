async function routes(fastify) {
    await fastify.register(require('./modules/auth/route'))
    await fastify.register(require('./modules/admin/route'))
    await fastify.register(require('./modules/mini/route'))
    await fastify.register(require('./modules/phone/route'))
    await fastify.register(require('./modules/brand/route'))
    await fastify.register(require('./modules/order/route'))
    await fastify.register(require('./modules/misc/route'))
    await fastify.register(require('./modules/file/route'))
}

module.exports = routes
