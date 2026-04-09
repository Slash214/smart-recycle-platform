require('dotenv').config()
const seq = require('../../db/seq')

async function run() {
    await seq.authenticate()
    const [rows] = await seq.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_returns'",
    )
    if (Array.isArray(rows) && rows.length > 0) {
        console.log('migrate-order-returns: table already exists')
        return
    }

    await seq.query(`
        CREATE TABLE order_returns (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL COMMENT '订单 ID',
            userid VARCHAR(255) NOT NULL DEFAULT '' COMMENT '申请用户ID',
            reason VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '退货原因',
            status TINYINT NOT NULL DEFAULT 10 COMMENT '10待审核 20已同意 30已拒绝',
            reject_reason VARCHAR(1000) NOT NULL DEFAULT '' COMMENT '拒绝原因',
            audit_admin_id INT NULL COMMENT '审核管理员ID',
            audit_at VARCHAR(255) NOT NULL DEFAULT '' COMMENT '审核时间',
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            INDEX idx_order_returns_order_id (order_id),
            INDEX idx_order_returns_userid (userid),
            INDEX idx_order_returns_status (status)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('migrate-order-returns: created table order_returns')
}

run()
    .then(() => {
        console.log('migrate-order-returns done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err && err.message ? err.message : err)
        process.exit(1)
    })
    .finally(async () => {
        await seq.close()
    })
