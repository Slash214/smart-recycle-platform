const { Order, OrderDevice } = require('../../../db/models')
const seq = require('../../../db/seq')
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

function toCleanString(value) {
    if (value === null || value === undefined) return ''
    return String(value).trim()
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

function mapDevicesFromRows(rows) {
    if (!Array.isArray(rows)) return []
    return rows.map((r) => ({
        id: r.id,
        model: r.model,
        memory: r.memory,
        unit: toInt(r.unit_type, 1) === 2 ? 'board' : 'whole',
        qty: toInt(r.qty, 0),
        price: r.price === null || r.price === undefined ? null : String(r.price),
    }))
}

/** 从备注里解析小程序旧版 MINI_ORDER_DEVICES_V1 JSON */
function parseDevicesFromRemark(remark) {
    if (!remark || typeof remark !== 'string') return []
    const marker = 'MINI_ORDER_DEVICES_V1:'
    const idx = remark.indexOf(marker)
    if (idx === -1) return []
    try {
        const json = remark.slice(idx + marker.length).trim()
        const parsed = JSON.parse(json)
        if (parsed && parsed.v === 1 && Array.isArray(parsed.devices)) {
            return parsed.devices
        }
    } catch (err) {
        return []
    }
    return []
}

function normalizeUnitToDb(unit) {
    const u = String(unit || '').trim().toLowerCase()
    if (u === 'board' || u === '单板' || u === '2') return 2
    return 1
}

/** 校验并转为入库行 */
function validateDeviceLines(raw) {
    if (!Array.isArray(raw) || raw.length === 0) return []
    const out = []
    for (let i = 0; i < raw.length; i++) {
        const d = raw[i] || {}
        const model = String(d.model ?? '').trim()
        const memory = String(d.memory ?? '').trim()
        const unit = normalizeUnitToDb(d.unit !== undefined ? d.unit : d.unit_type)
        const qty = toInt(d.qty, 0)
        if (!model) {
            throw new Error(`设备明细第 ${i + 1} 条：机型不能为空`)
        }
        if (!memory) {
            throw new Error(`设备明细第 ${i + 1} 条：内存不能为空`)
        }
        if (qty < 1) {
            throw new Error(`设备明细第 ${i + 1} 条：数量须为大于 0 的整数`)
        }
        const price =
            d.price === undefined || d.price === null || String(d.price).trim() === ''
                ? null
                : String(d.price).trim()
        out.push({ model, memory, unit_type: unit, qty, price })
    }
    return out
}

/** 将请求体中的 devices / 备注兜底解析为统一结构（创建订单用） */
function normalizeDevicesInput(payload = {}) {
    if (Array.isArray(payload.devices)) {
        if (payload.devices.length === 0) return []
        return validateDeviceLines(payload.devices)
    }
    const fromRemark = parseDevicesFromRemark(payload.remark)
    return validateDeviceLines(fromRemark)
}

function stripNonOrderFields(payload) {
    const next = { ...payload }
    delete next.devices
    return next
}

async function saveOrderDevices(orderId, lines, transaction) {
    await OrderDevice.destroy({ where: { order_id: orderId }, transaction })
    if (!lines.length) return
    const rows = lines.map((line, index) => ({
        order_id: orderId,
        model: line.model,
        memory: line.memory,
        unit_type: line.unit_type,
        qty: line.qty,
        price: line.price,
        sort_order: index,
    }))
    await OrderDevice.bulkCreate(rows, { transaction })
}

function normalizeOrderRow(row) {
    const plain = row.toJSON ? row.toJSON() : row
    const status = toInt(plain.status, 10)
    const devices = mapDevicesFromRows(plain.devices)
    delete plain.devices
    return {
        ...plain,
        devices,
        remark_images: parseRemarkImagesValue(plain.remark_images),
        status,
    }
}

function isValidOrderStatus(status) {
    return [10, 20, 30, 40, 50, 60].includes(toInt(status, -1))
}

function resolveOrderStatus(payload = {}) {
    if (payload.status !== undefined && payload.status !== '' && isValidOrderStatus(payload.status)) {
        return { status: toInt(payload.status, 10) }
    }
    return { status: 10 }
}

function mergeStatusFieldsForUpdate(payload, current) {
    if (payload.status !== undefined && payload.status !== '') {
        const nextStatus = toInt(payload.status, current.status)
        if (!isValidOrderStatus(nextStatus)) {
            throw new Error('status 仅支持 10/20/30/40/50/60')
        }
        return { status: nextStatus }
    }
    return {}
}

async function listOrders(query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.userid) where.userid = String(query.userid)
    if (query.type !== undefined && query.type !== '') where.type = toInt(query.type, 0)
    if (query.way !== undefined && query.way !== '') where.way = toInt(query.way, 1)
    if (query.status !== undefined && query.status !== '') where.status = toInt(query.status, 10)
    else where.status = { [Op.in]: [10, 20, 30, 40, 50, 60] }

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
        distinct: true,
        order: [['id', 'desc']],
        limit: pageSize,
        offset,
        include: [
            {
                model: OrderDevice,
                as: 'devices',
                required: false,
                separate: true,
                order: [
                    ['sort_order', 'ASC'],
                    ['id', 'ASC'],
                ],
            },
        ],
    })
    return { rows: result.rows.map(normalizeOrderRow), total: result.count, page, pageSize }
}

async function getOrder(id) {
    const row = await Order.findByPk(id, {
        include: [
            {
                model: OrderDevice,
                as: 'devices',
                required: false,
                separate: true,
                order: [
                    ['sort_order', 'ASC'],
                    ['id', 'ASC'],
                ],
            },
        ],
    })
    return row ? normalizeOrderRow(row) : null
}

async function createOrder(payload) {
    const deviceLines = normalizeDevicesInput(payload)
    const statusPayload = resolveOrderStatus(payload)
    const createPayload = stripNonOrderFields({
        ...payload,
        ...statusPayload,
        way: payload.way !== undefined && payload.way !== '' ? toInt(payload.way, 1) : 1,
        payee_name: toCleanString(payload.payee_name),
        wechat_account: toCleanString(payload.wechat_account),
        alipay_account: toCleanString(payload.alipay_account),
        bank_name: toCleanString(payload.bank_name),
        bank_card_no: toCleanString(payload.bank_card_no),
        express_company: payload.express_company || '',
        remark_images: normalizeRemarkImages(payload.remark_images),
    })
    if (deviceLines.length > 0) {
        const sumQty = deviceLines.reduce((s, l) => s + toInt(l.qty, 0), 0)
        createPayload.nums = sumQty
    }
    // 未传或空字符串时存 NULL，避免 NOT NULL 约束报错
    if (
        createPayload.price === undefined ||
        createPayload.price === null ||
        createPayload.price === ''
    ) {
        createPayload.price = null
    }
    const created = await seq.transaction(async (t) => {
        const orderRow = await Order.create(createPayload, { transaction: t })
        if (deviceLines.length > 0) {
            await saveOrderDevices(orderRow.id, deviceLines, t)
        }
        return orderRow
    })
    return getOrder(created.id)
}

async function updateOrder(id, payload) {
    const existingRow = await Order.findByPk(id)
    if (!existingRow) return null
    const current = normalizeOrderRow(existingRow)

    let deviceLines = null
    if (Object.prototype.hasOwnProperty.call(payload, 'devices')) {
        if (!Array.isArray(payload.devices)) {
            throw new Error('devices 必须为数组')
        }
        if (payload.devices.length === 0) {
            deviceLines = []
        } else {
            deviceLines = validateDeviceLines(payload.devices)
        }
    }

    const updatePayload = stripNonOrderFields({ ...payload })
    delete updatePayload.devices

    if (deviceLines && deviceLines.length > 0) {
        updatePayload.nums = deviceLines.reduce((s, l) => s + toInt(l.qty, 0), 0)
    } else if (deviceLines && deviceLines.length === 0 && Object.prototype.hasOwnProperty.call(payload, 'devices')) {
        updatePayload.nums = payload.nums !== undefined ? toInt(payload.nums, 0) : 0
    }

    if (
        updatePayload.price !== undefined &&
        (updatePayload.price === null || updatePayload.price === '')
    ) {
        updatePayload.price = null
    }
    if (payload.way !== undefined && payload.way !== '') {
        updatePayload.way = toInt(payload.way, 1)
    }
    if (payload.payee_name !== undefined) updatePayload.payee_name = toCleanString(payload.payee_name)
    if (payload.wechat_account !== undefined) updatePayload.wechat_account = toCleanString(payload.wechat_account)
    if (payload.alipay_account !== undefined) updatePayload.alipay_account = toCleanString(payload.alipay_account)
    if (payload.bank_name !== undefined) updatePayload.bank_name = toCleanString(payload.bank_name)
    if (payload.bank_card_no !== undefined) updatePayload.bank_card_no = toCleanString(payload.bank_card_no)
    if (payload.status !== undefined) {
        const merged = mergeStatusFieldsForUpdate(payload, current)
        if (Object.keys(merged).length) {
            Object.assign(updatePayload, merged)
        }
    }
    if (payload.remark_images !== undefined) {
        updatePayload.remark_images = normalizeRemarkImages(payload.remark_images)
    }

    await seq.transaction(async (t) => {
        await Order.update(updatePayload, { where: { id }, transaction: t })
        if (deviceLines !== null) {
            await saveOrderDevices(id, deviceLines, t)
        }
    })
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
