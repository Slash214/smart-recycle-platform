const seq = require('../seq')
const { STRING, INTEGER } = require('../type')

const Admin = seq.define('admin', {
    username: {
        type: STRING,
        allowNull: false,
        unique: true,
        comment: '管理员账号',
    },
    passwordHash: {
        type: STRING,
        allowNull: false,
        comment: '管理员密码哈希',
    },
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1 正常 0 禁用',
    },
})

module.exports = Admin
