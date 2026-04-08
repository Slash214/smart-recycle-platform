const fp = require('fastify-plugin')

async function authPlugin(fastify) {
    fastify.register(require('@fastify/jwt'), {
        secret: process.env.JWT_SECRET || 'replace-this-jwt-secret',
        sign: {
            expiresIn: '7d',
        },
    })

    fastify.decorate('authenticate', async function (request, reply) {
        try {
            await request.jwtVerify()
        } catch (error) {
            reply.code(401).send({
                code: 40101,
                message: '未授权或登录已过期',
                data: null,
            })
        }
    })
}

module.exports = fp(authPlugin)
