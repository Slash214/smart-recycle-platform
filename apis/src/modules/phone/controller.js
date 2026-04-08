const { ok, fail, toPaginationMeta } = require('../../common/response')
const {
    listPhones,
    getPhoneById,
    createPhone,
    updatePhone,
    deletePhone,
} = require('./service')

async function list(request) {
    const result = await listPhones(request.query)
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function detail(request, reply) {
    const data = await getPhoneById(request.params.id)
    if (!data) return reply.code(404).send(fail(40404, '记录不存在'))
    return ok(data)
}

async function create(request) {
    const data = await createPhone(request.body)
    return ok(data, '创建成功')
}

async function update(request, reply) {
    const data = await updatePhone(request.params.id, request.body)
    if (!data) return reply.code(404).send(fail(40404, '记录不存在'))
    return ok(data, '更新成功')
}

async function remove(request) {
    await deletePhone(request.params.id)
    return ok(true, '删除成功')
}

module.exports = {
    list,
    detail,
    create,
    update,
    remove,
}
