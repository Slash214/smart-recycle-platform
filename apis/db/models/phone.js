
const seq = require('../seq')
const { STRING, INTEGER } = require('../type')

const Phone = seq.define('phone', {
	name: {
		type: STRING,
		allowNull: false,
		comment: '手机名称'
	},
	brandId: {
		type: INTEGER,
		allowNull: false,
		comment: '所属品牌的ID'
	},
	price: {
		type: STRING,
		allowNull: false,
		comment: '手机单价价格'
	},
	cover: {
		type: STRING,
		comment: '手机封面图片',
		defaultValue: ''
	},
	series: {
		type: STRING,
		comment: '所属系列'
	},
	details: {
		type: STRING,
		allowNull: false,
		comment: '手机详情',
	},
	status: {
		type: INTEGER,
		defaultValue: 1,
		comment: '状态 1 正常 0 关闭'
	},
	orderNum: {
	    type: INTEGER,
		defaultValue: 1,
		comment: '排序规则 '
	}
})

module.exports = Phone