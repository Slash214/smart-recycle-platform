const { Address, Banner, Help, Config } = require('../../../db/models')

function toPage(query = {}) {
    const page = Math.max(parseInt(query.page || 1, 10), 1)
    const pageSize = Math.max(parseInt(query.pageSize || 20, 10), 1)
    return { page, pageSize, offset: (page - 1) * pageSize }
}

async function listByModel(Model, query) {
    const { page, pageSize, offset } = toPage(query)
    const where = {}
    if (query.status !== undefined) where.status = query.status
    const result = await Model.findAndCountAll({ where, order: [['id', 'desc']], limit: pageSize, offset })
    return { rows: result.rows, total: result.count, page, pageSize }
}

async function crud(Model, id, payload, softDelete = true) {
    if (!id) return Model.create(payload)
    if (payload === null) {
        if (softDelete) {
            await Model.update({ status: 0 }, { where: { id } })
            return true
        }
        await Model.destroy({ where: { id } })
        return true
    }
    await Model.update(payload, { where: { id } })
    return Model.findByPk(id)
}

module.exports = {
    Address,
    Banner,
    Help,
    Config,
    listByModel,
    crud,
}
