const controller = require('./controller')

async function adminRoutes(fastify) {
    fastify.get(
        '/admin/stats/dashboard',
        {
            tags: ['admin'],
            summary: '管理员仪表盘总览统计',
            preHandler: [fastify.authenticate],
        },
        controller.dashboardStats
    )
    fastify.get(
        '/admin/stats/mini-users',
        {
            tags: ['admin'],
            summary: '管理员查看小程序用户统计',
            preHandler: [fastify.authenticate],
        },
        controller.miniUserStats
    )

    fastify.get(
        '/admin/users',
        {
            tags: ['admin'],
            summary: '管理员用户列表',
            preHandler: [fastify.authenticate],
        },
        controller.users
    )
    fastify.get(
        '/admin/users/:id',
        {
            tags: ['admin'],
            summary: '管理员用户详情',
            preHandler: [fastify.authenticate],
        },
        controller.userDetail
    )
    fastify.put(
        '/admin/users/:id',
        {
            tags: ['admin'],
            summary: '管理员更新用户信息',
            preHandler: [fastify.authenticate],
        },
        controller.userUpdate
    )
    fastify.put(
        '/admin/users/:id/status',
        {
            tags: ['admin'],
            summary: '管理员启用/禁用用户',
            preHandler: [fastify.authenticate],
        },
        controller.userStatus
    )
}

module.exports = adminRoutes
