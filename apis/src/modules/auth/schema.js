const loginSchema = {
    summary: '登录并签发 JWT',
    tags: ['auth'],
    body: {
        type: 'object',
        required: ['openid'],
        properties: {
            openid: { type: 'string' },
            platform: { type: 'string', default: 'WECHAT' },
            userName: { type: 'string' },
        },
    },
}

const adminLoginSchema = {
    summary: '管理员登录并签发 JWT',
    tags: ['auth'],
    body: {
        type: 'object',
        required: ['username', 'password'],
        properties: {
            username: { type: 'string' },
            password: { type: 'string' },
        },
    },
}

const adminChangePasswordSchema = {
    summary: '管理员修改密码',
    tags: ['auth'],
    security: [{ bearerAuth: [] }],
    body: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string', minLength: 6 },
        },
    },
}

module.exports = {
    loginSchema,
    adminLoginSchema,
    adminChangePasswordSchema,
}
