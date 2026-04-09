const seq = require('../seq')
const { STRING, INTEGER, TINYINT } = require('../type')

/** 订单回收明细：机型 + 内存 + 整机/单板 + 数量（单行报价可后续扩展） */
const OrderDevice = seq.define(
    'order_device',
    {
        order_id: {
            type: INTEGER,
            allowNull: false,
            comment: '订单 ID',
        },
        model: {
            type: STRING(255),
            allowNull: false,
            defaultValue: '',
            comment: '机型',
        },
        memory: {
            type: STRING(100),
            allowNull: false,
            defaultValue: '',
            comment: '内存',
        },
        unit_type: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 1,
            comment: '1 整机 2 单板',
        },
        qty: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '数量',
        },
        price: {
            type: STRING(50),
            allowNull: true,
            defaultValue: null,
            comment: '该型号配置单独价格（可空，报价后填写）',
        },
        sort_order: {
            type: INTEGER,
            allowNull: false,
            defaultValue: 0,
            comment: '排序',
        },
    },
    {
        tableName: 'order_devices',
        indexes: [{ fields: ['order_id'] }],
    },
)

module.exports = OrderDevice
