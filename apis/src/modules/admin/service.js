const { User, Order, UserBrandInteraction, Brand, Phone, Banner, Address, Help } = require('../../../db/models')
const { Op } = require('../../../db/type')

function getTodayStart() {
    const d = new Date()
    d.setHours(0, 0, 0, 0)
    return d
}

async function getMiniUserStats() {
    const todayStart = getTodayStart()

    const [
        totalUsers,
        activeUsers,
        todayNewUsers,
        totalOrders,
        todayOrders,
        viewedBrandCount,
    ] = await Promise.all([
        User.count({ where: { platform: 'WECHAT' } }),
        User.count({ where: { platform: 'WECHAT', status: 1 } }),
        User.count({ where: { platform: 'WECHAT', createdAt: { [Op.gte]: todayStart } } }),
        Order.count(),
        Order.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
        UserBrandInteraction.count({ where: { hasViewed: true } }),
    ])

    return {
        totalUsers,
        activeUsers,
        todayNewUsers,
        totalOrders,
        todayOrders,
        viewedBrandCount,
    }
}

module.exports = {
    getMiniUserStats,
    async listUsers(query = {}) {
        const page = Math.max(parseInt(query.page || 1, 10), 1)
        const pageSize = Math.max(parseInt(query.pageSize || 20, 10), 1)
        const offset = (page - 1) * pageSize
        const where = {}

        if (query.platform) where.platform = query.platform
        if (query.status !== undefined && query.status !== '') where.status = parseInt(query.status, 10)
        if (query.keyword) {
            where[Op.or] = [
                { userName: { [Op.like]: `%${query.keyword}%` } },
                { mobile: { [Op.like]: `%${query.keyword}%` } },
                { openid: { [Op.like]: `%${query.keyword}%` } },
            ]
        }

        const result = await User.findAndCountAll({
            where,
            order: [['id', 'desc']],
            limit: pageSize,
            offset,
        })

        return { rows: result.rows, total: result.count, page, pageSize }
    },
    async getUserById(id) {
        return User.findByPk(id)
    },
    async updateUser(id, payload) {
        await User.update(payload, { where: { id } })
        return User.findByPk(id)
    },
    async setUserStatus(id, status) {
        await User.update({ status }, { where: { id } })
        return User.findByPk(id)
    },
    async getDashboardStats() {
        const todayStart = getTodayStart()
        const [
            totalUsers,
            totalMiniUsers,
            todayNewUsers,
            totalOrders,
            todayOrders,
            totalBrands,
            totalPhones,
            totalBanners,
            totalAddresses,
            totalHelps,
            viewedBrandCount,
        ] = await Promise.all([
            User.count(),
            User.count({ where: { platform: 'WECHAT' } }),
            User.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
            Order.count(),
            Order.count({ where: { createdAt: { [Op.gte]: todayStart } } }),
            Brand.count({ where: { status: 1 } }),
            Phone.count({ where: { status: 1 } }),
            Banner.count({ where: { status: 1 } }),
            Address.count({ where: { status: 1 } }),
            Help.count({ where: { status: 1 } }),
            UserBrandInteraction.count({ where: { hasViewed: true } }),
        ])

        return {
            totalUsers,
            totalMiniUsers,
            todayNewUsers,
            totalOrders,
            todayOrders,
            totalBrands,
            totalPhones,
            totalBanners,
            totalAddresses,
            totalHelps,
            viewedBrandCount,
        }
    },
}
