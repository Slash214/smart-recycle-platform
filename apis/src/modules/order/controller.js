const { ok, fail, toPaginationMeta } = require('../../common/response')
const service = require('./service')

function isAdmin(request) {
    return request.user && request.user.role === 'admin'
}

function isValidInBoundStatus(status) {
    return [10, 20].includes(parseInt(status, 10))
}

function isValidSettlementStatus(status) {
    return [10, 20, 30, 40, 50].includes(parseInt(status, 10))
}

function hasPriceValue(price) {
    if (price === null || price === undefined) return false
    return String(price).trim() !== ''
}

function cleaned(value) {
    if (value === null || value === undefined) return ''
    return String(value).trim()
}

function validatePayoutFields(payload, base = {}) {
    const merged = { ...base, ...payload }
    const way = parseInt(merged.way, 10) || 1
    const wechat = cleaned(merged.wechat_account)
    const alipay = cleaned(merged.alipay_account)
    const payeeName = cleaned(merged.payee_name)
    const bankName = cleaned(merged.bank_name)
    const bankCardNo = cleaned(merged.bank_card_no)

    if (way === 1 && !wechat) {
        return '微信收款方式需要填写 wechat_account'
    }
    if (way === 2 && !alipay) {
        return '支付宝收款方式需要填写 alipay_account'
    }
    if (way === 3) {
        if (!payeeName) return '银行卡收款方式需要填写 payee_name'
        if (!bankName) return '银行卡收款方式需要填写 bank_name'
        if (!bankCardNo) return '银行卡收款方式需要填写 bank_card_no'
    }
    return ''
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
    const hasDeviceLines =
        (Array.isArray(body.devices) && body.devices.length > 0) ||
        (typeof body.remark === 'string' && body.remark.includes('MINI_ORDER_DEVICES_V1:'))
    if (!body.nums && !hasDeviceLines) {
        return reply.code(400).send(fail(40001, 'nums 必填（或提交回收明细 devices）'))
    }
    if (body.inbound_status !== undefined && !isValidInBoundStatus(body.inbound_status)) {
        return reply.code(400).send(fail(40001, 'inbound_status 仅支持 10/20'))
    }
    if (body.settlement_status !== undefined && !isValidSettlementStatus(body.settlement_status)) {
        return reply.code(400).send(fail(40001, 'settlement_status 仅支持 10/20/30/40/50'))
    }
    const settlementStatus = parseInt(body.settlement_status, 10)
    if (!Number.isNaN(settlementStatus) && settlementStatus >= 20 && !hasPriceValue(body.price)) {
        return reply.code(400).send(fail(40001, '结算状态为已报价及之后时，price 必填'))
    }
    const payoutErr = validatePayoutFields(body)
    if (payoutErr) {
        return reply.code(400).send(fail(40001, payoutErr))
    }
    try {
        const data = await service.createOrder(body)
        return ok(data, '创建成功')
    } catch (err) {
        const msg = err && err.message ? err.message : '创建失败'
        return reply.code(400).send(fail(40001, msg))
    }
}

async function update(request, reply) {
    const old = await service.getOrder(request.params.id)
    if (!old) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(old.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限更新该订单'))
    }

    const body = { ...(request.body || {}) }
    if (!isAdmin(request)) {
        const allowed = new Set([
            'settlement_status',
            'way',
            'payee_name',
            'wechat_account',
            'alipay_account',
            'bank_name',
            'bank_card_no',
        ])
        const invalidKey = Object.keys(body).find((k) => !allowed.has(k))
        if (invalidKey) {
            return reply.code(403).send(fail(40301, `普通用户不允许更新字段：${invalidKey}`))
        }
        if (body.settlement_status !== undefined && parseInt(body.settlement_status, 10) !== 40) {
            return reply.code(400).send(fail(40001, '普通用户仅允许确认结算（settlement_status=40）'))
        }
        if (!hasPriceValue(old.price)) {
            return reply.code(400).send(fail(40001, '当前订单尚未报价，无法确认结算'))
        }
    }
    if (body.inbound_status !== undefined && !isValidInBoundStatus(body.inbound_status)) {
        return reply.code(400).send(fail(40001, 'inbound_status 仅支持 10/20'))
    }
    if (body.settlement_status !== undefined && !isValidSettlementStatus(body.settlement_status)) {
        return reply.code(400).send(fail(40001, 'settlement_status 仅支持 10/20/30/40/50'))
    }
    const nextSettlementStatus = body.settlement_status !== undefined
        ? parseInt(body.settlement_status, 10)
        : parseInt(old.settlement_status, 10)
    const nextPrice = body.price !== undefined ? body.price : old.price
    if (!Number.isNaN(nextSettlementStatus) && nextSettlementStatus >= 20 && !hasPriceValue(nextPrice)) {
        return reply.code(400).send(fail(40001, '结算状态为已报价及之后时，price 必填'))
    }
    const payoutErr = validatePayoutFields(body, old)
    if (payoutErr) {
        return reply.code(400).send(fail(40001, payoutErr))
    }
    try {
        const data = await service.updateOrder(request.params.id, body)
        return ok(data, '更新成功')
    } catch (err) {
        const msg = err && err.message ? err.message : '更新失败'
        return reply.code(400).send(fail(40001, msg))
    }
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

async function applyReturn(request, reply) {
    const order = await service.getOrder(request.params.id)
    if (!order) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(order.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限申请该订单退货'))
    }
    if (parseInt(order.settlement_status, 10) !== 40) {
        return reply.code(400).send(fail(40001, '仅已结算订单可申请退货'))
    }
    const latest = await service.getLatestReturnByOrder(order.id)
    if (latest && parseInt(latest.status, 10) === 10) {
        return reply.code(400).send(fail(40001, '已有待审核退货申请，请勿重复提交'))
    }
    const reason = String(request.body?.reason || '').trim()
    if (!reason) {
        return reply.code(400).send(fail(40001, '退货原因必填'))
    }
    const data = await service.createReturnRequest(order, request.user && request.user.uid, reason)
    return ok(data, '退货申请已提交')
}

async function latestReturn(request, reply) {
    const order = await service.getOrder(request.params.id)
    if (!order) return reply.code(404).send(fail(40404, '记录不存在'))
    if (!isAdmin(request) && String(order.userid) !== String(request.user && request.user.uid)) {
        return reply.code(403).send(fail(40301, '无权限查看该订单退货申请'))
    }
    const data = await service.getLatestReturnByOrder(order.id)
    return ok(data || null, 'ok')
}

async function listReturns(request, reply) {
    if (!isAdmin(request)) return reply.code(403).send(fail(40301, '仅管理员可查看'))
    const result = await service.listReturnRequests(request.query || {})
    return ok(result.rows, 'ok', toPaginationMeta(result.page, result.pageSize, result.total))
}

async function auditReturn(request, reply) {
    if (!isAdmin(request)) return reply.code(403).send(fail(40301, '仅管理员可审核'))
    const { action, reject_reason } = request.body || {}
    if (!['approve', 'reject'].includes(String(action))) {
        return reply.code(400).send(fail(40001, 'action 仅支持 approve/reject'))
    }
    if (String(action) === 'reject' && !String(reject_reason || '').trim()) {
        return reply.code(400).send(fail(40001, '拒绝时 reject_reason 必填'))
    }
    try {
        const data = await service.auditReturnRequest(
            request.params.id,
            String(action),
            reject_reason,
            request.user && request.user.uid,
        )
        if (!data) return reply.code(404).send(fail(40404, '退货申请不存在'))
        return ok(data, '审核成功')
    } catch (err) {
        return reply.code(400).send(fail(40001, err && err.message ? err.message : '审核失败'))
    }
}

module.exports = { list, detail, create, update, remove, applyReturn, latestReturn, listReturns, auditReturn }
