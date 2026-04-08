require('dotenv').config()
const seq = require('../../db/seq')

async function run() {
    await seq.authenticate()
    await seq.query(`CREATE TABLE IF NOT EXISTS configs (
        id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(255) NOT NULL DEFAULT 'default' COMMENT '配置名称',
        servicePhone VARCHAR(255) NOT NULL DEFAULT '' COMMENT '客服电话',
        contactWechat VARCHAR(255) NOT NULL DEFAULT '' COMMENT '联系微信',
        defaultAddress VARCHAR(500) NOT NULL DEFAULT '' COMMENT '默认收货地址',
        defaultContactName VARCHAR(255) NOT NULL DEFAULT '' COMMENT '默认收货地址联系人',
        defaultContactPhone VARCHAR(255) NOT NULL DEFAULT '' COMMENT '默认收货地址联系方式',
        userAgreement LONGTEXT NULL COMMENT '用户协议富文本',
        privacyPolicy LONGTEXT NULL COMMENT '隐私政策富文本',
        remark VARCHAR(500) NOT NULL DEFAULT '' COMMENT '备注说明',
        status INT NOT NULL DEFAULT 1 COMMENT '状态 1启用 0停用',
        createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    )`)

    const [cols] = await seq.query('SHOW COLUMNS FROM configs')
    const names = new Set((cols || []).map((c) => c.Field))
    if (!names.has('userAgreement')) {
        await seq.query("ALTER TABLE configs ADD COLUMN userAgreement LONGTEXT NULL COMMENT '用户协议富文本' AFTER defaultContactPhone")
    }
    if (!names.has('privacyPolicy')) {
        await seq.query("ALTER TABLE configs ADD COLUMN privacyPolicy LONGTEXT NULL COMMENT '隐私政策富文本' AFTER userAgreement")
    }
}

run()
    .then(() => {
        console.log('migrate-configs done')
        process.exit(0)
    })
    .catch((err) => {
        console.error(err && err.message ? err.message : err)
        process.exit(1)
    })
    .finally(async () => {
        await seq.close()
    })
