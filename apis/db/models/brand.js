const seq = require('../seq')
const { STRING, INTEGER, TINYINT } = require('../type')

const Brand = seq.define('brand', {
	brand: {
		type: STRING,
		allowNull: false,
		comment: '品牌名称'
	},
	logo: {
		type: STRING,
		comment: '品牌图片',
		defaultValue: ''
	},
	status: {
		type: INTEGER,
		defaultValue: 1,
		comment: '状态 1 正常 0 关闭'
	},
	ptypeId: {
		type: INTEGER,
		allowNull: false,
		comment: '所属一级类目ID（关联 ptype.id）'
	},
	updateinfo: {
		type: TINYINT,
		defaultValue: 0,
		comment: '0 为 没更新内容， 1 更新了内容'
	},
	orderNum: {
	    type: INTEGER,
	    defaultValue: 1,
	    comment: '排序规则 数字越大越靠前'
	}
}, {
	indexes: [
		{ fields: ['ptypeId'] },
		{ fields: ['status'] },
		{ fields: ['orderNum'] },
	]
})

module.exports = Brand