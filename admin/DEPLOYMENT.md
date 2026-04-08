# 部署说明文档

## 📋 项目检查完成

已完成项目全面检查，修复了以下问题：

### ✅ 已修复的问题

1. **API URL 硬编码问题**
   - 修改 `src/constants/app.ts`，使用环境变量 `VITE_API_URL`
   - 修改 `IMAGE_CDN_DOMAIN`，使用环境变量 `VITE_CDN_DOMAIN`
   - 创建 `.env.example` 作为环境变量配置示例

2. **生产环境调试代码**
   - 所有 `console.log/error/warn` 语句已包装在 `import.meta.env.DEV` 检查中
   - 生产环境不会输出调试信息，提升性能

3. **打包配置优化**
   - 优化 `vite.config.ts`，添加代码分割配置
   - 分离 vendor chunks（react、antd、refine、editor）
   - 启用 CSS 压缩和 ESBuild 压缩

4. **性能优化**
   - 检查了所有 `useEffect` hooks，确保有正确的清理函数
   - 确认没有明显的内存泄漏问题

### 📝 环境变量配置

在生产环境部署前，需要创建 `.env.production` 文件：

```bash
# API 地址（生产环境）
VITE_API_URL=https://your-api-domain.com/v1

# CDN 域名（生产环境）
VITE_CDN_DOMAIN=https://img.dfsmkj.cn
```

### 🚀 构建和部署步骤

1. **安装依赖**
   ```bash
   npm install
   # 或
   pnpm install
   ```

2. **配置环境变量**
   ```bash
   # 复制示例文件
   cp .env.example .env.production
   
   # 编辑 .env.production，填入实际的生产环境配置
   ```

3. **构建生产版本**
   ```bash
   npm run build
   # 或
   pnpm build
   ```

4. **构建输出**
   - 构建产物在 `dist/` 目录
   - 可以直接部署到静态文件服务器（Nginx、Apache等）

### 📦 打包优化说明

- **代码分割**：自动将大型库分离为独立的 chunk
  - `react-vendor`: React 相关库
  - `antd-vendor`: Ant Design UI 库
  - `refine-vendor`: Refine 框架库
  - `editor-vendor`: TinyMCE 编辑器库

- **压缩优化**：
  - JavaScript: ESBuild 压缩
  - CSS: 自动压缩
  - 源码映射：生产环境已禁用（如需调试可启用）

### ⚠️ 注意事项

1. **测试文件**
   - `src/pages/banners/test.tsx` 和 `test-cors.tsx` 是测试文件
   - 生产环境建议移除这些路由（已在 `App.tsx` 中配置）

2. **API 地址**
   - 确保生产环境的 API 地址正确配置
   - 检查 CORS 设置，确保前端域名被允许

3. **CDN 配置**
   - 确保 CDN 域名正确配置
   - 检查图片资源路径是否正确

### 🔍 性能检查

- ✅ 所有 `useEffect` hooks 都有正确的依赖数组
- ✅ 所有定时器都有清理函数（`clearInterval`）
- ✅ 没有发现明显的内存泄漏
- ✅ 代码分割已优化，减少初始加载时间

### 📊 构建产物大小

构建后可以通过以下命令查看产物大小：
```bash
npm run build
# 查看 dist/ 目录中的文件大小
```

### 🐛 已知问题

1. **Ant Design Menu 警告**
   - 来自 `@refinedev/antd` 库的内部实现
   - 不影响功能，可以暂时忽略
   - 等待库更新到支持新 API 的版本

### 📞 问题排查

如果部署后遇到问题：

1. **检查环境变量**
   - 确认 `.env.production` 文件存在且配置正确
   - 确认环境变量名称以 `VITE_` 开头

2. **检查 API 连接**
   - 打开浏览器开发者工具
   - 查看 Network 标签页，检查 API 请求是否成功

3. **检查控制台错误**
   - 查看浏览器控制台是否有 JavaScript 错误
   - 检查是否有 CORS 错误

4. **检查构建产物**
   - 确认 `dist/` 目录中有所有必要的文件
   - 确认 `index.html` 存在且正确

