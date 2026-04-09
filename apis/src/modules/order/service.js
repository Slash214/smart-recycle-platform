const { Order, OrderDevice, OrderReturn } = require('../../../db/models')
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
        out.push({ model, memory, unit_type: unit, qty })
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
        sort_order: index,
    }))
    await OrderDevice.bulkCreate(rows, { transaction })
}

function normalizeOrderRow(row) {
    const plain = row.toJSON ? row.toJSON() : row
    const inboundStatus = toInt(plain.inbound_status, 10)
    const settlementStatus = toInt(plain.settlement_status, 10)
    const devices = mapDevicesFromRows(plain.devices)
    delete plain.devices
    return {
        ...plain,
        devices,
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
    if (payload.inbound_status !== undefined || payload.settlement_status !== undefined || payload.status !== undefined) {
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

async function getLatestReturnByOrder(orderId) {
    const row = await OrderReturn.findOne({
        where: { order_id: orderId },
        order: [['id', 'desc']],
    })
    return row ? (row.toJSON ? row.toJSON() : row) : null
}

async function createReturnRequest(order, userid, reason) {
    const now = new Date().toISOString()
    return seq.transaction(async (t) => {
        const created = await OrderReturn.create(
            {
                order_id: order.id,
                userid: String(userid),
                reason: String(reason).trim(),
                status: 10,
                audit_at: '',
                reject_reason: '',
            },
            { transaction: t },
        )
        await Order.update(
            {
                settlement_status: 50,
                status: mapLegacyStatus(order.inbound_status, 50),
                updatedAt: now,
            },
            { where: { id: order.id }, transaction: t },
        )
        return created.toJSON ? created.toJSON() : created
    })
}

async function listReturnRequests(query = {}) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.status !== undefined && query.status !== '') where.status = toInt(query.status, 10)
    if (query.keyword) {
        const keyword = String(query.keyword).trim()
        if (keyword) {
            where[Op.or] = [{ reason: { [Op.like]: `%${keyword}%` } }, { userid: { [Op.like]: `%${keyword}%` } }]
        }
    }
    const result = await OrderReturn.findAndCountAll({
        where,
        order: [['id', 'desc']],
        limit: pageSize,
        offset,
        include: [{ model: Order, required: false }],
    })
    return { rows: result.rows.map((r) => (r.toJSON ? r.toJSON() : r)), total: result.count, page, pageSize }
}

async function auditReturnRequest(id, action, rejectReason, adminId) {
    const row = await OrderReturn.findByPk(id)
    if (!row) return null
    const current = row.toJSON ? row.toJSON() : row
    if (toInt(current.status, 10) !== 10) {
        throw new Error('仅待审核申请可操作')
    }
    const nextStatus = action === 'approve' ? 20 : 30
    const nextOrderSettlement = action === 'approve' ? 60 : 70
    const now = new Date().toISOString()

    await seq.transaction(async (t) => {
        await OrderReturn.update(
            {
                status: nextStatus,
                reject_reason: action === 'reject' ? String(rejectReason || '').trim() : '',
                audit_admin_id: adminId ? Number(adminId) : null,
                audit_at: now,
            },
            { where: { id }, transaction: t },
        )
        const orderRow = await Order.findByPk(current.order_id, { transaction: t })
        if (orderRow) {
            const orderPlain = orderRow.toJSON ? orderRow.toJSON() : orderRow
            await Order.update(
                {
                    settlement_status: nextOrderSettlement,
                    status: mapLegacyStatus(toInt(orderPlain.inbound_status, 10), nextOrderSettlement),
                    updatedAt: now,
                },
                { where: { id: current.order_id }, transaction: t },
            )
        }
    })
    const reloaded = await OrderReturn.findByPk(id)
    return reloaded ? (reloaded.toJSON ? reloaded.toJSON() : reloaded) : null
}

module.exports = {
    listOrders,
    getOrder,
    createOrder,
    updateOrder,
    deleteOrder,
    getLatestReturnByOrder,
    createReturnRequest,
    listReturnRequests,
    auditReturnRequest,
}
