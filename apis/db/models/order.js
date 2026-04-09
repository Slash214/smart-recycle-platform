
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
		allowNull: true,
		comment: '价格（可空，待报价后再填）'
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
		defaultValue: 1,
		comment: '收款方式：1微信 2支付宝 3银行卡'
	},
	payee_name: {
		type: STRING,
		comment: '收款人姓名（银行卡必填）',
		defaultValue: ''
	},
	wechat_account: {
		type: STRING,
		comment: '微信收款账号',
		defaultValue: ''
	},
	alipay_account: {
		type: STRING,
		comment: '支付宝收款账号',
		defaultValue: ''
	},
	bank_name: {
		type: STRING,
		comment: '开户行名称',
		defaultValue: ''
	},
	bank_card_no: {
		type: STRING,
		comment: '银行卡号',
		defaultValue: ''
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
		defaultValue: 10,
		comment: '订单状态：10已下单 20已签收 30已报价 40已确认 50已返款 60已完成 0已删除'
	},
	inbound_status: {
		type: TINYINT,
		defaultValue: 10,
		comment: '入库状态：10待入库 20已入库'
	},
	settlement_status: {
		type: TINYINT,
		defaultValue: 10,
		comment: '结算状态：10待报价 20已报价 30待结算 40已结算 50退货中 0已删除'
	},
})

module.exports = Order