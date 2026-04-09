const { Order } = require('../../../db/models')
const { Op } = require('../../../db/type')

function toPage(query = {}) {
    const page = Math.max(parseInt(query.page || 1, 10), 1)
    const pageSize = Math.max(parseInt(query.pageSize || 20, 10), 1)
    return { page, pageSize, offset: (page - 1) * pageSize }
}

function toInt(value, fallback) {
    const n = parseInt(value, 10)
    return Number.isNaN(n) ? fallback : n
}

function normalizeRemarkImages(input) {
    if (!input) return '[]'
    if (Array.isArray(input)) return JSON.stringify(input.filter(Boolean))
    if (typeof input === 'object') {
        return JSON.stringify(Object.values(input).filter(Boolean))
    }
    if (typeof input === 'string') {
        try {
            const parsed = JSON.parse(input)
            if (Array.isArray(parsed)) return JSON.stringify(parsed.filter(Boolean))
        } catch (err) {
            return JSON.stringify([input])
        }
    }
    return '[]'
}

function parseRemarkImagesValue(value) {
    if (!value) return []
    try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
    } catch (err) {
        return []
    }
}

function normalizeOrderRow(row) {
    const plain = row.toJSON ? row.toJSON() : row
    const inboundStatus = toInt(plain.inbound_status, 10)
    const settlementStatus = toInt(plain.settlement_status, 10)
    return {
        ...plain,
        remark_images: parseRemarkImagesValue(plain.remark_images),
        inbound_status: inboundStatus,
        settlement_status: settlementStatus,
        status: plain.status === 0 ? 0 : mapLegacyStatus(inboundStatus, settlementStatus),
    }
}

function mapLegacyStatus(inboundStatus, settlementStatus) {
    if (settlementStatus >= 40) return 3
    if (inboundStatus >= 20) return 2
    return 1
}

function resolveOrderStatus(payload = {}) {
    const hasInbound = payload.inbound_status !== undefined && payload.inbound_status !== ''
    const hasSettlement = payload.settlement_status !== undefined && payload.settlement_status !== ''
    if (hasInbound || hasSettlement) {
        const inboundStatus = hasInbound ? toInt(payload.inbound_status, 10) : 10
        const settlementStatus = hasSettlement ? toInt(payload.settlement_status, 10) : 10
        return {
            inbound_status: inboundStatus,
            settlement_status: settlementStatus,
            status: mapLegacyStatus(inboundStatus, settlementStatus),
        }
    }
    return { inbound_status: 10, settlement_status: 10, status: 1 }
}

/** 更新订单时与当前记录合并，避免只改一项却把另一项重置为默认值 */
function mergeStatusFieldsForUpdate(payload, current) {
    const touchesInbound = payload.inbound_status !== undefined
    const touchesSettlement = payload.settlement_status !== undefined
    const touchesLegacyStatus = payload.status !== undefined

    if (touchesInbound || touchesSettlement) {
        const inboundStatus = touchesInbound ? toInt(payload.inbound_status, current.inbound_status) : current.inbound_status
        const settlementStatus = touchesSettlement
            ? toInt(payload.settlement_status, current.settlement_status)
            : current.settlement_status
        return {
            inbound_status: inboundStatus,
            settlement_status: settlementStatus,
            status: mapLegacyStatus(inboundStatus, settlementStatus),
        }
    }
    if (touchesLegacyStatus) {
        return { status: toInt(payload.status, current.status) }
    }
    return {}
}

async function listOrders(query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.userid) where.userid = String(query.userid)
    if (query.type !== undefined && query.type !== '') where.type = toInt(query.type, 0)
    if (query.way !== undefined && query.way !== '') where.way = toInt(query.way, 1)
    if (query.inbound_status !== undefined && query.inbound_status !== '') where.inbound_status = toInt(query.inbound_status, 10)
    if (query.settlement_status !== undefined && query.settlement_status !== '') where.settlement_status = toInt(query.settlement_status, 10)
    if (query.status !== undefined && query.status !== '') where.status = toInt(query.status, 1)
    else where.status = { [Op.in]: [1, 2, 3] }

    if (query.keyword) {
        const keyword = String(query.keyword).trim()
        if (keyword) {
            where[Op.or] = [
                { phone: { [Op.like]: `%${keyword}%` } },
                { tracking_number: { [Op.like]: `%${keyword}%` } },
                { express_company: { [Op.like]: `%${keyword}%` } },
                { remark: { [Op.like]: `%${keyword}%` } },
            ]
        }
    }

    if (query.startAt || query.endAt) {
        where.createdAt = {}
        if (query.startAt) where.createdAt[Op.gte] = query.startAt
        if (query.endAt) where.createdAt[Op.lte] = query.endAt
    }

    const result = await Order.findAndCountAll({
        where,
        order: [['id', 'desc']],
        limit: pageSize,
        offset,
    })
    return { rows: result.rows.map(normalizeOrderRow), total: result.count, page, pageSize }
}

async function getOrder(id) {
    const row = await Order.findByPk(id)
    return row ? normalizeOrderRow(row) : null
}

async function createOrder(payload) {
    const statusPayload = resolveOrderStatus(payload)
    const createPayload = {
        ...payload,
        ...statusPayload,
        way: payload.way !== undefined && payload.way !== '' ? toInt(payload.way, 1) : 1,
        express_company: payload.express_company || '',
        remark_images: normalizeRemarkImages(payload.remark_images),
    }
    // 未传或空字符串时存 NULL，避免 NOT NULL 约束报错
    if (
        createPayload.price === undefined ||
        createPayload.price === null ||
        createPayload.price === ''
    ) {
        createPayload.price = null
    }
    const created = await Order.create(createPayload)
    return normalizeOrderRow(created)
}

async function updateOrder(id, payload) {
    const existingRow = await Order.findByPk(id)
    if (!existingRow) return null
    const current = normalizeOrderRow(existingRow)

    const updatePayload = { ...payload }
    if (
        updatePayload.price !== undefined &&
        (updatePayload.price === null || updatePayload.price === '')
    ) {
        updatePayload.price = null
    }
    if (payload.way !== undefined && payload.way !== '') {
        updatePayload.way = toInt(payload.way, 1)
    }
    if (payload.inbound_status !== undefined || payload.settlement_status !== undefined || payload.status !== undefined) {
        const merged = mergeStatusFieldsForUpdate(payload, current)
        if (Object.keys(merged).length) {
            Object.assign(updatePayload, merged)
        }
    }
    if (payload.remark_images !== undefined) {
        updatePayload.remark_images = normalizeRemarkImages(payload.remark_images)
    }
    await Order.update(updatePayload, { where: { id } })
    await existingRow.reload()
    return normalizeOrderRow(existingRow)
}

async function deleteOrder(id) { await Order.update({ status: 0 }, { where: { id } }) }

module.exports = {
    listOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
}
