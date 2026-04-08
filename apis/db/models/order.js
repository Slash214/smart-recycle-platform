
const seq = require('../seq')
const { STRING, INTEGER, TINYINT } = require('../type')

const Order = seq.define('order', {
	nums: {
		type: INTEGER,
		allowNull: false,
		comment: '下单数量'
	},
	price: {
		type: STRING,
		allowNull: false,
		comment: '价格'
	},
	phone: {
		type: STRING,
		allowNull: false,
		comment: '用户手机号'
	},
	remark: {
		type: STRING,
		comment: '备注信息',
		defaultValue: ''
	},
	express_company: {
		type: STRING,
		comment: '快递公司（字符串）',
		defaultValue: ''
	},
	remark_images: {
		type: STRING(2000),
		comment: '备注图片URL数组(JSON字符串)',
		defaultValue: '[]'
	},
	way: {
		type: TINYINT,
		defaultValue: 0,
		comment: '1 表示自己寄 2 表示快递上门  0 空不是不是物流发货'
	},
	userid: {
		type: STRING,
		allowNull: false,
		comment: '用户唯一标识符'
	},
	type: {
		type: TINYINT,
		allowNull: false,
		comment: '1 师傅上门， 2 物流发货'
	},
	visit_time: {
		type: STRING,
		comment: '上门服务时间'
	},
	tracking_number: {
		type: STRING,
		comment: '快递单号'
	},
	areas: {
		type: STRING,
		comment: '地址'
	},
	hourse_number: {
		type: STRING,
		comment: '门牌号'
	},
	status: {
		type: INTEGER,
		defaultValue: 1,
		comment: '订单状态：1待确认 2进行中 3已完成 0已删除'
	},
})

module.exports = Order