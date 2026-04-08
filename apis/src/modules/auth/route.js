const { login, adminLogin, adminChangePassword } = require('./controller')
const { loginSchema, adminLoginSchema, adminChangePasswordSchema } = require('./schema')

async function authRoutes(fastify) {
    fastify.post('/auth/login', { schema: loginSchema }, login)
    fastify.post('/auth/admin/login', { schema: adminLoginSchema }, adminLogin)
    fastify.put(
        '/auth/admin/password',
        { schema: adminChangePasswordSchema, preHandler: [fastify.authenticate] },
        adminChangePassword
    )
}

module.exports = authRoutes
