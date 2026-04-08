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

