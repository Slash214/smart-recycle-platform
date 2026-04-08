const fse = require('fs-extra')
const { ok, fail } = require('../../common/response')
const { uploadToQiniu } = require('./service')

async function fileRoutes(fastify) {
    fastify.post('/files/images', { preHandler: [fastify.authenticate], tags: ['file'] }, async (request, reply) => {
        const file = await request.file()
        if (!file) return reply.code(400).send(fail(40001, 'file 必传'))

        const tempPath = `${process.cwd()}/tmp_${Date.now()}_${file.filename}`
        await fse.ensureFile(tempPath)
        await fse.writeFile(tempPath, await file.toBuffer())

        try {
            const result = await uploadToQiniu(tempPath, file.filename)
            return ok(result, '上传成功')
        } finally {
            await fse.remove(tempPath)
        }
    })
}

module.exports = fileRoutes
