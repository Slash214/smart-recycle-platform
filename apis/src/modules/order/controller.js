const { ok, fail, toPaginationMeta } = require('../../common/response')
const service = require('./service')

function isAdmin(request) {
    return request.user && request.user.role === 'admin'
}

function isValidOrderStatus(status) {
    return [10, 20, 30, 40, 50, 60].includes(parseInt(status, 10))
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
    if (body.status !== undefined && !isValidOrderStatus(body.status)) {
        return reply.code(400).send(fail(40001, 'status 仅支持 10/20/30/40/50/60'))
    }
    const status = parseInt(body.status, 10)
    if (!Number.isNaN(status) && status >= 30 && !hasPriceValue(body.price)) {
        return reply.code(400).send(fail(40001, '状态为已报价及之后时，price 必填'))
    }
    if (!Number.isNaN(status) && status >= 30 && Array.isArray(body.devices) && body.devices.length > 0) {
        const missPrice = body.devices.findIndex((d) => !hasPriceValue(d?.price))
        if (missPrice >= 0) {
            return reply.code(400).send(fail(40001, `状态为已报价及之后时，devices 第 ${missPrice + 1} 行价格必填`))
        }
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
            'status',
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
        if (body.status !== undefined && parseInt(body.status, 10) !== 40) {
            return reply.code(400).send(fail(40001, '普通用户仅允许确认状态为已确认（status=40）'))
        }
        if (!hasPriceValue(old.price)) {
            return reply.code(400).send(fail(40001, '当前订单尚未报价，无法确认结算'))
        }
    }
    if (body.status !== undefined && !isValidOrderStatus(body.status)) {
        return reply.code(400).send(fail(40001, 'status 仅支持 10/20/30/40/50/60'))
    }
    const nextStatus = body.status !== undefined
        ? parseInt(body.status, 10)
        : parseInt(old.status, 10)
    const nextPrice = body.price !== undefined ? body.price : old.price
    if (!Number.isNaN(nextStatus) && nextStatus >= 30 && !hasPriceValue(nextPrice)) {
        return reply.code(400).send(fail(40001, '状态为已报价及之后时，price 必填'))
    }
    if (!Number.isNaN(nextStatus) && nextStatus >= 30 && Array.isArray(body.devices) && body.devices.length > 0) {
        const missPrice = body.devices.findIndex((d) => !hasPriceValue(d?.price))
        if (missPrice >= 0) {
            return reply.code(400).send(fail(40001, `状态为已报价及之后时，devices 第 ${missPrice + 1} 行价格必填`))
        }
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

module.exports = { list, detail, create, update, remove }
