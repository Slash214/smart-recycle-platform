require('dotenv').config()
const seq = require('../../db/seq')

async function run() {
    await seq.authenticate()
    const [cols] = await seq.query('SHOW COLUMNS FROM orders')
    const names = new Set((cols || []).map((c) => c.Field))

    if (!names.has('payee_name')) {
        await seq.query("ALTER TABLE orders ADD COLUMN payee_name VARCHAR(255) NOT NULL DEFAULT '' COMMENT '收款人姓名（银行卡必填）' AFTER way")
    }
    if (!names.has('wechat_account')) {
        await seq.query("ALTER TABLE orders ADD COLUMN wechat_account VARCHAR(255) NOT NULL DEFAULT '' COMMENT '微信收款账号' AFTER payee_name")
    }
    if (!names.has('alipay_account')) {
        await seq.query("ALTER TABLE orders ADD COLUMN alipay_account VARCHAR(255) NOT NULL DEFAULT '' COMMENT '支付宝收款账号' AFTER wechat_account")
    }
    if (!names.has('bank_name')) {
        await seq.query("ALTER TABLE orders ADD COLUMN bank_name VARCHAR(255) NOT NULL DEFAULT '' COMMENT '开户行名称' AFTER alipay_account")
    }
    if (!names.has('bank_card_no')) {
        await seq.query("ALTER TABLE orders ADD COLUMN bank_card_no VARCHAR(255) NOT NULL DEFAULT '' COMMENT '银行卡号' AFTER bank_name")
    }
}

run()
    .then(() => {
        console.log('migrate-order-payment-fields done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err && err.message ? err.message : err)
        process.exit(1)
    })
    .finally(async () => {
        await seq.close()
    })
