const { ok, fail, toPaginationMeta } = require('../../common/response')
const service = require('./service')

function isAdmin(request) {
    return request.user && request.user.role === 'admin'
}

async function list(request) {
    const query = { ...(request.query || {}) }
    if (!isAdmin(request) && request.user && request.user.uid) {
        query.userid = String(request.user.uid)
    }
    const result = await service.listOrders(query)
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function detail(request, reply) {
    const data = await service.getOrder(request.params.id)
    if (!data) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(data.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限查看该订单'))
    }
    return ok(data)
}

async function create(request, reply) {
    const body = { ...(request.body || {}) }
    if (!isAdmin(request) && request.user && request.user.uid) {
        body.userid = String(request.user.uid)
    }
    if (!body.userid) {
        return reply.code(400).send(fail(40001, 'userid 必填'))
    }
    if (!body.phone || !String(body.phone).trim()) {
        return reply.code(400).send(fail(40001, 'phone 必填'))
    }
    if (!body.nums) {
        return reply.code(400).send(fail(40001, 'nums 必填'))
    }
    if (body.status !== undefined && ![1, 2, 3].includes(parseInt(body.status, 10))) {
        return reply.code(400).send(fail(40001, 'status 仅支持 1/2/3'))
    }
    return ok(await service.createOrder(body), '创建成功')
}

async function update(request, reply) {
    const old = await service.getOrder(request.params.id)
    if (!old) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(old.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限更新该订单'))
    }

    const body = { ...(request.body || {}) }
    if (body.status !== undefined && ![1, 2, 3].includes(parseInt(body.status, 10))) {
        return reply.code(400).send(fail(40001, 'status 仅支持 1/2/3'))
    }
    return ok(await service.updateOrder(request.params.id, body), '更新成功')
}

async function remove(request, reply) {
    const old = await service.getOrder(request.params.id)
    if (!old) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(old.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限删除该订单'))
    }
    await service.deleteOrder(request.params.id)
    return ok(true, '删除成功')
}

module.exports = { list, detail, create, update, remove }
