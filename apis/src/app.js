require('dotenv').config()
require('../db/models')

const Fastify = require('fastify')
const authPlugin = require('./plugins/auth')
const swaggerPlugin = require('./plugins/swagger')
const routes = require('./routes')
const { fail } = require('./common/response')

function buildApp() {
    const app = Fastify({ logger: true })

    app.register(require('@fastify/cors'), {
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
    })
    app.register(require('@fastify/multipart'), {
        limits: { fileSize: 10 * 1024 * 1024 },
    })
    app.register(authPlugin)
    app.register(swaggerPlugin)

    app.register(async function apiV1(instance) {
        instance.register(routes)
    }, { prefix: '/api/v1' })

    app.get('/health', async () => ({ ok: true }))

    app.setErrorHandler((error, request, reply) => {
        request.log.error(error)
        const statusCode = error.statusCode || 500
        reply.code(statusCode).send(fail(statusCode, error.message || '服务器错误'))
    })

    return app
}

module.exports = buildApp
