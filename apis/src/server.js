const buildApp = require('./app')

async function start() {
    const app = buildApp()
    const port = Number(process.env.PORT || 3100)
    const host = process.env.HOST || '0.0.0.0'

    try {
        await app.listen({ port, host })
        app.log.info(`server running at http://${host}:${port}`)
    } catch (error) {
        app.log.error(error)
        process.exit(1)
    }
}

start()
