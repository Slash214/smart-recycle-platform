const { ok, fail, toPaginationMeta } = require('../../common/response')
const service = require('./service')

async function list(request) {
    const result = await service.listBrands(request.query)
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function detail(request, reply) {
    const data = await service.getBrand(request.params.id)
    if (!data) return reply.code(404).send(fail(40404, '记录不存在'))
    return ok(data)
}

async function create(request, reply) {
    if (!request.body || !request.body.ptypeId) {
        return reply.code(400).send(fail(40001, 'ptypeId 必填'))
    }
    return ok(await service.createBrand(request.body), '创建成功')
}
async function update(request, reply) {
    if (request.body && Object.prototype.hasOwnProperty.call(request.body, 'ptypeId') && !request.body.ptypeId) {
        return reply.code(400).send(fail(40001, 'ptypeId 不能为空'))
    }
    return ok(await service.updateBrand(request.params.id, request.body), '更新成功')
}
async function remove(request) { await service.deleteBrand(request.params.id); return ok(true, '删除成功') }

async function getDetails(request) { return ok(await service.getBrandDetails(request.params.id)) }
async function listDetails(request) {
    const result = await service.listBrandDetails(request.query || {})
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}
async function putDetails(request, reply) {
    const { content = '', imageUrls = [] } = request.body || {}
    if (!content && (!Array.isArray(imageUrls) || imageUrls.length === 0)) {
        return reply.code(400).send(fail(40001, 'content 和 imageUrls 不能同时为空'))
    }
    return ok(await service.upsertBrandDetails(request.params.id, content, imageUrls), '更新成功')
}

async function listTypes() { return ok(await service.listTypes()) }
async function createType(request) { return ok(await service.createType(request.body), '创建成功') }
async function updateType(request) { return ok(await service.updateType(request.params.id, request.body), '更新成功') }
async function removeType(request) { await service.deleteType(request.params.id); return ok(true, '删除成功') }

async function userViewed(request) {
    const { userId, brandId } = request.body
    if (!userId || !brandId) return fail(40001, 'userId 和 brandId 必填')
    return ok(await service.markBrandViewed(userId, brandId), '已记录')
}

module.exports = {
    list,
    detail,
    create,
    update,
    remove,
    listDetails,
    getDetails,
    putDetails,
    listTypes,
    createType,
    updateType,
    removeType,
    userViewed,
}
