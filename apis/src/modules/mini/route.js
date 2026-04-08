const controller = require('./controller')
const schema = require('./schema')

async function miniRoutes(fastify) {
    fastify.post('/mini/auth/silent-login', { schema: schema.silentLoginSchema }, controller.silentLogin)
    fastify.get('/mini/banners', { schema: schema.bannersSchema }, controller.banners)
    fastify.get('/mini/categories', { schema: schema.categoriesSchema }, controller.categories)
    fastify.get('/mini/type-brands', { schema: schema.typeBrandsSchema }, controller.typeBrands)
    fastify.get('/mini/brands/:id/images', { schema: schema.brandDetailImagesSchema }, controller.brandDetailImages)
    fastify.get('/mini/default-address', { schema: schema.defaultAddressSchema }, controller.defaultAddress)
    fastify.get('/mini/policy', { schema: schema.policySchema }, controller.policy)
    fastify.get('/mini/site-config', { schema: schema.siteConfigSchema }, controller.siteConfig)
}

module.exports = miniRoutes
