const { ok, fail } = require('../../common/response')
const { loginByOpenId, loginAdmin, updateAdminPassword } = require('./service')

async function login(request, reply) {
    const { openid, platform, userName } = request.body || {}
    if (!openid) {
        return reply.code(400).send(fail(40001, 'openid 必填'))
    }

    const user = await loginByOpenId({ openid, platform, userName })
    const token = await reply.jwtSign({
        uid: user.id,
        openid: user.openid,
        platform: user.platform,
    })

    return ok({
        token,
        user,
    }, '登录成功')
}

module.exports = {
    login,
    async adminLogin(request, reply) {
        const { username, password } = request.body || {}
        if (!username || !password) {
            return reply.code(400).send(fail(40001, 'username 和 password 必填'))
        }

        const admin = await loginAdmin({ username, password })
        if (!admin) {
            return reply.code(401).send(fail(40102, '账号或密码错误'))
        }

        const token = await reply.jwtSign({
            aid: admin.id,
            role: 'admin',
            username: admin.username,
        })

        return ok({
            token,
            admin: {
                id: admin.id,
                username: admin.username,
                status: admin.status,
            },
        }, '管理员登录成功')
    },
    async adminChangePassword(request, reply) {
        const { oldPassword, newPassword } = request.body || {}
        if (!oldPassword || !newPassword) {
            return reply.code(400).send(fail(40001, 'oldPassword 和 newPassword 必填'))
        }
        if (newPassword.length < 6) {
            return reply.code(400).send(fail(40003, '新密码长度至少 6 位'))
        }

        const adminId = request.user && request.user.aid
        if (!adminId) {
            return reply.code(401).send(fail(40101, '未授权或登录已过期'))
        }

        const result = await updateAdminPassword({ adminId, oldPassword, newPassword })
        if (!result.ok) {
            return reply.code(400).send(fail(result.code, result.message))
        }
        return ok(true, '密码修改成功')
    },
}
