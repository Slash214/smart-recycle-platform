const seq = require('../seq')
const { STRING, INTEGER } = require('../type')

const User = seq.define('user', {
    openid: {
        type: STRING,
        allowNull: false,
        comment: '用户唯一标识符',
    },
    userName: {
        type: STRING,
        comment: '用户名',
        allowNull: false,
    },
    mobile: {
        type: STRING,
        defaultValue: '',
        comment: '手机号',
    },
    avatar: {
        type: STRING,
		defaultValue: '',
        comment: '头像',
	},
	level: {
		type: STRING,
		defaultValue: '',
        comment: '身份',
	},
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1 正常 0 关闭',
    },
    platform: {
        type: STRING,
		defaultValue: 'WECHAT',
        comment: '平台用户',
    },
    session_key: {
        type: STRING,
		defaultValue: '',
        comment: '密钥',
    }
})

module.exports = User
