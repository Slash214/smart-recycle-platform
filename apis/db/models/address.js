const seq = require('../seq')
const { STRING, INTEGER, DECIMAL, TINYINT } = require('../type')

const Address = seq.define('address', {
    user: {
        type: STRING,
        allowNull: false,
        comment: '用户名称',
    },
    wechat: {
        type: STRING,
        comment: '微信号',
        allowNull: false,
    },
    address: {
        type: STRING,
        allowNull: false,
        comment: '地址',
    },
    fullAddress: {
        type: STRING,
        allowNull: false,
        comment: '详细地址',
    },
    img: {
        type: STRING,
        allowNull: false,
        comment: '图片',
    },
    latitude: {
        type: DECIMAL(9, 6),
        comment: '// 经度字段，DECIMAL 类型表示带有指定精度和小数位数的十进制数',
    },
    longitude: {
        type: DECIMAL(9, 6), 
        comment: "// 纬度字段，DECIMAL 类型表示带有指定精度和小数位数的十进制数"
    },
    busin: {
        type: STRING,
        allowNull: false,
        comment: '营业时间',
    },
    mobile: {
        type: STRING,
        allowNull: false,
        comment: '手机号',
    },
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1 正常 0 关闭',
    },
    defaultAddress: {
        type: TINYINT,
        defaultValue: 0,
        comment: '默认地址 1 为默认  0 为不是'
    }
})

module.exports = Address
