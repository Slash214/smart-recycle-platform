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
    return {
        ...plain,
        remark_images: parseRemarkImagesValue(plain.remark_images),
    }
}

async function listOrders(query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.userid) where.userid = String(query.userid)
    if (query.type !== undefined && query.type !== '') where.type = toInt(query.type, 0)
    if (query.way !== undefined && query.way !== '') where.way = toInt(query.way, 0)
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
    const createPayload = {
        ...payload,
        status: payload.status ? toInt(payload.status, 1) : 1,
        express_company: payload.express_company || '',
        remark_images: normalizeRemarkImages(payload.remark_images),
    }
    const created = await Order.create(createPayload)
    return normalizeOrderRow(created)
}

async function updateOrder(id, payload) {
    const updatePayload = { ...payload }
    if (payload.remark_images !== undefined) {
        updatePayload.remark_images = normalizeRemarkImages(payload.remark_images)
    }
    if (payload.status !== undefined && payload.status !== '') {
        updatePayload.status = toInt(payload.status, 1)
    }
    await Order.update(updatePayload, { where: { id } })
    return getOrder(id)
}

async function deleteOrder(id) { await Order.update({ status: 0 }, { where: { id } }) }

module.exports = {
    listOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
}
