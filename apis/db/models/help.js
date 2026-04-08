
const seq = require('../seq')
const { INTEGER, STRING, TINYINT,  } = require('../type')

const Help = seq.define('help', {
	type: {
		type: TINYINT,
		allowNull: false,
		comment: '问题类型 1 回收问题 - 2 邮寄问题'
	},
	title: {
		type: STRING,
		allowNull: false,
		comment: '问题标题',
	},
	solution: {
		type: STRING,
		allowNull: false,
		comment: '问题的解决办法'
	},
	status: {
		type: TINYINT,
		defaultValue: 1,
		comment: '当前状态 1 正常 '
	}
})

module.exports = Help