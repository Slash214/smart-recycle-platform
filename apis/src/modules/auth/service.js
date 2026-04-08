const bcrypt = require('bcryptjs')
const { User, Admin } = require('../../../db/models')

async function loginByOpenId({ openid, platform = 'WECHAT', userName }) {
    let user = await User.findOne({ where: { openid } })
    if (!user) {
        const count = await User.count()
        user = await User.create({
            openid,
            userName: userName || `用户${count + 10000}`,
            mobile: '',
            platform,
        })
    }
    return user
}

module.exports = {
    loginByOpenId,
    async ensureDefaultAdmin() {
        const username = process.env.ADMIN_DEFAULT_USERNAME
        const password = process.env.ADMIN_DEFAULT_PASSWORD
        if (!username || !password) return null

        let admin = await Admin.findOne({ where: { username } })
        if (!admin) {
            const passwordHash = await bcrypt.hash(password, 10)
            admin = await Admin.create({ username, passwordHash, status: 1 })
        }
        return admin
    },
    async loginAdmin({ username, password }) {
        await module.exports.ensureDefaultAdmin()
        const admin = await Admin.findOne({ where: { username, status: 1 } })
        if (!admin) return null
        const matched = await bcrypt.compare(password, admin.passwordHash)
        if (!matched) return null
        return admin
    },
    async updateAdminPassword({ adminId, oldPassword, newPassword }) {
        const admin = await Admin.findByPk(adminId)
        if (!admin || admin.status !== 1) return { ok: false, code: 40404, message: '管理员不存在' }

        const matched = await bcrypt.compare(oldPassword, admin.passwordHash)
        if (!matched) return { ok: false, code: 40002, message: '旧密码错误' }

        const passwordHash = await bcrypt.hash(newPassword, 10)
        await Admin.update({ passwordHash }, { where: { id: adminId } })
        return { ok: true }
    },
}
