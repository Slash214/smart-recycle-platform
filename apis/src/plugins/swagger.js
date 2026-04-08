const fp = require('fastify-plugin')

async function swaggerPlugin(fastify) {
    await fastify.register(require('@fastify/swagger'), {
        openapi: {
            info: {
                title: 'Recycle Digital API',
                description: 'Fastify v1 API 文档',
                version: '1.0.0',
            },
            servers: [{ url: '/api/v1' }],
            components: {
                securitySchemes: {
                    bearerAuth: {
                        type: 'http',
                        scheme: 'bearer',
                        bearerFormat: 'JWT',
                    },
                },
            },
        },
    })

    await fastify.register(require('@fastify/swagger-ui'), {
        routePrefix: '/docs',
    })
}

module.exports = fp(swaggerPlugin)
