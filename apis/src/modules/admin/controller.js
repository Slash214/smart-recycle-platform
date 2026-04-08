const { ok, fail, toPaginationMeta } = require('../../common/response')
const {
    getMiniUserStats,
    listUsers,
    getUserById,
    updateUser,
    setUserStatus,
    getDashboardStats,
} = require('./service')

async function miniUserStats() {
    const data = await getMiniUserStats()
    return ok(data, 'ok')
}

async function dashboardStats() {
    const data = await getDashboardStats()
    return ok(data, 'ok')
}

async function users(request) {
    const result = await listUsers(request.query || {})
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function userDetail(request, reply) {
    const id = parseInt(request.params.id, 10)
    if (!id) return reply.code(400).send(fail(40001, '用户ID无效'))
    const data = await getUserById(id)
    if (!data) return reply.code(404).send(fail(40404, '用户不存在'))
    return ok(data, 'ok')
}

async function userUpdate(request, reply) {
    const id = parseInt(request.params.id, 10)
    if (!id) return reply.code(400).send(fail(40001, '用户ID无效'))
    const data = await updateUser(id, request.body || {})
    if (!data) return reply.code(404).send(fail(40404, '用户不存在'))
    return ok(data, '更新成功')
}

async function userStatus(request, reply) {
    const id = parseInt(request.params.id, 10)
    const status = parseInt((request.body || {}).status, 10)
    if (!id || ![0, 1].includes(status)) {
        return reply.code(400).send(fail(40001, '参数错误（id/status）'))
    }
    const data = await setUserStatus(id, status)
    if (!data) return reply.code(404).send(fail(40404, '用户不存在'))
    return ok(data, status === 1 ? '启用成功' : '禁用成功')
}

module.exports = {
    miniUserStats,
    dashboardStats,
    users,
    userDetail,
    userUpdate,
    userStatus,
}
