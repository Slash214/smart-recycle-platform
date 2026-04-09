const seq = require('../seq')
const { STRING, INTEGER, TINYINT } = require('../type')

/**
 * 订单退货申请
 * status: 10待审核 20已同意 30已拒绝
 */
const OrderReturn = seq.define(
    'order_return',
    {
        order_id: {
            type: INTEGER,
            allowNull: false,
            comment: '订单 ID',
        },
        userid: {
            type: STRING,
            allowNull: false,
            defaultValue: '',
            comment: '申请用户ID',
        },
        reason: {
            type: STRING(1000),
            allowNull: false,
            defaultValue: '',
            comment: '退货原因',
        },
        status: {
            type: TINYINT,
            allowNull: false,
            defaultValue: 10,
            comment: '10待审核 20已同意 30已拒绝',
        },
        reject_reason: {
            type: STRING(1000),
            allowNull: false,
            defaultValue: '',
            comment: '拒绝原因',
        },
        audit_admin_id: {
            type: INTEGER,
            allowNull: true,
            comment: '审核管理员ID',
        },
        audit_at: {
            type: STRING,
            allowNull: false,
            defaultValue: '',
            comment: '审核时间',
        },
    },
    {
        tableName: 'order_returns',
        indexes: [{ fields: ['order_id'] }, { fields: ['userid'] }, { fields: ['status'] }],
    },
)

module.exports = OrderReturn
