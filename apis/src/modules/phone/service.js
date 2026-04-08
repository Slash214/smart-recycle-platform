const { Phone } = require('../../../db/models')

function toPage(query = {}) {
    const page = Math.max(parseInt(query.page || 1, 10), 1)
    const pageSize = Math.max(parseInt(query.pageSize || 20, 10), 1)
    return { page, pageSize, offset: (page - 1) * pageSize }
}

async function listPhones(query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.brandId) where.brandId = query.brandId
    if (query.status !== undefined) where.status = query.status

    const result = await Phone.findAndCountAll({
        where,
        order: [['id', 'desc']],
        limit: pageSize,
        offset,
    })
    return { rows: result.rows, total: result.count, page, pageSize }
}

async function getPhoneById(id) {
    return Phone.findByPk(id)
}

async function createPhone(payload) {
    return Phone.create(payload)
}

async function updatePhone(id, payload) {
    await Phone.update(payload, { where: { id } })
    return getPhoneById(id)
}

async function deletePhone(id) {
    await Phone.update({ status: 0 }, { where: { id } })
}

module.exports = {
    listPhones,
    getPhoneById,
    createPhone,
    updatePhone,
    deletePhone,
}
