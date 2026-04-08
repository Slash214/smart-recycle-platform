const seq = require('../seq')
const { STRING, INTEGER, TINYINT } = require('../type')

const PType = seq.define('ptype', {
    typeName: {
        type: STRING,
        allowNull: false,
        comment: '类型名称',
    },
    orderNo: {
        type: TINYINT,
        defaultValue: 1,
        comment: '排序',
    },
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1 正常 0 关闭',
    },
})

module.exports = PType
