const seq = require('../seq')
const { STRING, INTEGER, LONGTEXT } = require('../type')

const Config = seq.define('config', {
    name: {
        type: STRING,
        allowNull: false,
        defaultValue: 'default',
        comment: '配置名称',
    },
    servicePhone: {
        type: STRING,
        defaultValue: '',
        comment: '客服电话',
    },
    contactWechat: {
        type: STRING,
        defaultValue: '',
        comment: '联系微信',
    },
    defaultAddress: {
        type: STRING(500),
        defaultValue: '',
        comment: '默认收货地址',
    },
    defaultContactName: {
        type: STRING,
        defaultValue: '',
        comment: '默认收货地址联系人',
    },
    defaultContactPhone: {
        type: STRING,
        defaultValue: '',
        comment: '默认收货地址联系方式',
    },
    userAgreement: {
        type: LONGTEXT,
        defaultValue: '',
        comment: '用户协议富文本',
    },
    privacyPolicy: {
        type: LONGTEXT,
        defaultValue: '',
        comment: '隐私政策富文本',
    },
    remark: {
        type: STRING(500),
        defaultValue: '',
        comment: '备注说明',
    },
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1启用 0停用',
    },
})

module.exports = Config
