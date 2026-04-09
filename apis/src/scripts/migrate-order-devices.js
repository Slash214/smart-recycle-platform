require('dotenv').config()
const seq = require('../../db/seq')

async function run() {
    await seq.authenticate()
    const [rows] = await seq.query(
        "SELECT TABLE_NAME FROM information_schema.TABLES WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'order_devices'",
    )
    if (Array.isArray(rows) && rows.length > 0) {
        console.log('migrate-order-devices: table order_devices already exists')
        return
    }
    await seq.query(`
        CREATE TABLE order_devices (
            id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
            order_id INT NOT NULL COMMENT '订单 ID',
            model VARCHAR(255) NOT NULL DEFAULT '' COMMENT '机型',
            memory VARCHAR(100) NOT NULL DEFAULT '' COMMENT '内存',
            unit_type TINYINT NOT NULL DEFAULT 1 COMMENT '1 整机 2 单板',
            qty INT NOT NULL DEFAULT 0 COMMENT '数量',
            sort_order INT NOT NULL DEFAULT 0 COMMENT '排序',
            createdAt DATETIME NOT NULL,
            updatedAt DATETIME NOT NULL,
            INDEX idx_order_devices_order_id (order_id)
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
    `)
    console.log('migrate-order-devices: created order_devices')
}

run()
    .then(() => {
        console.log('migrate-order-devices done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err && err.message ? err.message : err)
        process.exit(1)
    })
    .finally(async () => {
        await seq.close()
    })
