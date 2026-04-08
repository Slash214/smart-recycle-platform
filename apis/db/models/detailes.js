
const seq = require('../seq')
const { INTEGER, LONGTEXT } = require('../type')

const Details = seq.define('details', {
	brandId: {
		type: INTEGER,
		allowNull: false,
		comment: '品牌名称'
	},
	content: {
		type: LONGTEXT,
		allowNull: false,
		comment: '富文本内容',
	},
	imageUrls: {
		type: LONGTEXT,
		allowNull: false,
		defaultValue: '[]',
		field: 'image_urls',
		comment: '详情截图图片URL数组(JSON字符串)',
	},
	status: {
		type: INTEGER,
		defaultValue: 1,
		comment: '状态 1 正常 0 关闭'
	},
})

module.exports = Details