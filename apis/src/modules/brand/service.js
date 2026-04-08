const { Brand, Details, Ptype, UserBrandInteraction } = require('../../../db/models')
function normalizeImageUrls(imageUrls) {
    if (Array.isArray(imageUrls)) return imageUrls
    if (!imageUrls) return []
    if (typeof imageUrls === 'string') {
        try {
            const parsed = JSON.parse(imageUrls)
            return Array.isArray(parsed) ? parsed : []
        } catch (e) {
            return []
        }
    }
    return []
}

function normalizeDetailsRow(row) {
    if (!row) return row
    const data = row.toJSON ? row.toJSON() : row
    return {
        ...data,
        imageUrls: normalizeImageUrls(data.imageUrls),
    }
}

function toPage(query = {}) {
    const page = Math.max(parseInt(query.page || 1, 10), 1)
    const pageSize = Math.max(parseInt(query.pageSize || 20, 10), 1)
    return { page, pageSize, offset: (page - 1) * pageSize }
}

async function listBrands(query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.ptypeId !== undefined && query.ptypeId !== '') where.ptypeId = parseInt(query.ptypeId, 10)
    if (query.status !== undefined && query.status !== '') where.status = parseInt(query.status, 10)
    const result = await Brand.findAndCountAll({
        where,
        include: [{ model: Ptype, as: 'ptype', attributes: ['id', 'typeName'] }],
        order: [['orderNum', 'desc'], ['id', 'desc']],
        limit: pageSize,
        offset,
    })
    return { rows: result.rows, total: result.count, page, pageSize }
}

async function createBrand(payload) {
    if (!payload || !payload.ptypeId) throw new Error('ptypeId 必填')
    return Brand.create(payload)
}
async function getBrand(id) { return Brand.findByPk(id) }
async function updateBrand(id, payload) {
    await Brand.update(payload, { where: { id } })
    return getBrand(id)
}
async function deleteBrand(id) { await Brand.update({ status: 0 }, { where: { id } }) }

async function getBrandDetails(brandId) {
    const row = await Details.findOne({ where: { brandId, status: 1 } })
    return normalizeDetailsRow(row)
}
async function listBrandDetails(query = {}) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.brandId !== undefined && query.brandId !== '') where.brandId = parseInt(query.brandId, 10)
    if (query.status !== undefined && query.status !== '') where.status = parseInt(query.status, 10)

    const result = await Details.findAndCountAll({
        where,
        order: [['id', 'desc']],
        limit: pageSize,
        offset,
    })
    return { rows: result.rows.map(normalizeDetailsRow), total: result.count, page, pageSize }
}
async function upsertBrandDetails(brandId, content, imageUrls = []) {
    const imageUrlsPayload = JSON.stringify(normalizeImageUrls(imageUrls))
    const existing = await Details.findOne({ where: { brandId } })
    if (existing) {
        await Details.update({ content, imageUrls: imageUrlsPayload, status: 1 }, { where: { id: existing.id } })
        const row = await Details.findByPk(existing.id)
        return normalizeDetailsRow(row)
    }
    const row = await Details.create({ brandId, content, imageUrls: imageUrlsPayload, status: 1 })
    return normalizeDetailsRow(row)
}

async function listTypes() { return Ptype.findAll({ order: [['id', 'asc']] }) }
async function createType(payload) { return Ptype.create(payload) }
async function updateType(id, payload) { await Ptype.update(payload, { where: { id } }); return Ptype.findByPk(id) }
async function deleteType(id) { return Ptype.destroy({ where: { id } }) }

async function markBrandViewed(userId, brandId) {
    const [record] = await UserBrandInteraction.findOrCreate({
        where: { userId, brandId },
        defaults: { hasViewed: true },
    })
    if (!record.hasViewed) await record.update({ hasViewed: true })
    return record
}

module.exports = {
    listBrands,
    createBrand,
    getBrand,
    updateBrand,
    deleteBrand,
    listBrandDetails,
    getBrandDetails,
    upsertBrandDetails,
    listTypes,
    createType,
    updateType,
    deleteType,
    markBrandViewed,
}
