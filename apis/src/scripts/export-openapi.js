const fse = require('fs-extra')
const path = require('path')
const buildApp = require('../app')

async function run() {
    const app = buildApp()
    await app.ready()
    const spec = app.swagger()
    const target = path.join(process.cwd(), 'docs', 'openapi.json')
    await fse.ensureDir(path.dirname(target))
    await fse.writeJson(target, spec, { spaces: 2 })
    await app.close()
    // eslint-disable-next-line no-console
    console.log(`OpenAPI exported: ${target}`)
}

run().catch((err) => {
    // eslint-disable-next-line no-console
    console.error(err)
    process.exit(1)
})
