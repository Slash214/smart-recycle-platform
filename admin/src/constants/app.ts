/**
 * 应用常量配置
 */

// 应用名称
export const APP_NAME = '数码网'

// 应用简称
export const APP_SHORT_NAME = '数码网'

// API 地址 - Fastify v1 默认前缀为 /api/v1
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3100/api/v1'

// CDN 域名 - 使用环境变量，生产环境需要配置
export const IMAGE_CDN_DOMAIN = import.meta.env.VITE_CDN_DOMAIN || 'https://img.shumahuishou.com'
