require('dotenv').config()
const seq = require('../../db/seq')

async function run() {
    await seq.authenticate()
    const [cols] = await seq.query('SHOW COLUMNS FROM orders')
    const names = new Set((cols || []).map((c) => c.Field))

    if (!names.has('express_company')) {
        await seq.query("ALTER TABLE orders ADD COLUMN express_company VARCHAR(255) NOT NULL DEFAULT '' COMMENT '快递公司（字符串）' AFTER remark")
    }
    if (!names.has('remark_images')) {
        await seq.query("ALTER TABLE orders ADD COLUMN remark_images VARCHAR(2000) NOT NULL DEFAULT '[]' COMMENT '备注图片URL数组(JSON字符串)' AFTER express_company")
    }
    if (!names.has('inbound_status')) {
        await seq.query("ALTER TABLE orders ADD COLUMN inbound_status TINYINT NOT NULL DEFAULT 10 COMMENT '入库状态：10待入库 20已入库' AFTER status")
    }
    if (!names.has('settlement_status')) {
        await seq.query("ALTER TABLE orders ADD COLUMN settlement_status TINYINT NOT NULL DEFAULT 10 COMMENT '结算状态：10待报价 20已报价 30待结算 40已结算 50退货中 0已删除' AFTER inbound_status")
    }
    await seq.query("UPDATE orders SET inbound_status = 10, settlement_status = 10 WHERE status = 1 AND (inbound_status IS NULL OR settlement_status IS NULL OR settlement_status = 0)")
    await seq.query("UPDATE orders SET inbound_status = 20, settlement_status = 30 WHERE status = 2 AND (inbound_status IS NULL OR settlement_status IS NULL OR settlement_status = 0)")
    await seq.query("UPDATE orders SET inbound_status = 20, settlement_status = 40 WHERE status = 3 AND (inbound_status IS NULL OR settlement_status IS NULL OR settlement_status = 0)")
}

run()
    .then(() => {
        console.log('migrate-order-fields done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err && err.message ? err.message : err)
        process.exit(1)
    })
    .finally(async () => {
        await seq.close()
    })

