# 回收数码平台

这是一个统一仓库（Monorepo）项目，包含三个子应用：

- `app/`：小程序端（uni-app）
- `apis/`：服务接口（Fastify + Sequelize）
- `admin/`：管理端（Refine + React + Vite）

## 目录结构

```text
.
├─ app/      # 小程序端
├─ apis/     # 服务接口
├─ admin/    # 管理端
└─ .gitignore
```

## 环境要求

- Node.js 18+
- npm 9+
- MySQL（用于 `apis/`）

## 快速开始

分别进入三个目录安装依赖：

```bash
cd app && npm install
cd ../apis && npm install
cd ../admin && npm install
```

## 启动方式

### 1) 服务接口（`apis/`）

```bash
cd apis
npm run dev
```

生产启动：

```bash
npm run start
```

### 2) 管理端（`admin/`）

```bash
cd admin
npm run dev
```

构建：

```bash
npm run build
```

### 3) 小程序端（`app/`）

微信小程序开发：

```bash
cd app
npm run dev
```

等价命令：

```bash
npm run dev:mp-weixin
```

H5 开发：

```bash
npm run dev:h5
```

## Git 提交约定

仓库已通过根目录 `.gitignore` 忽略以下内容，不会上传到 Git：

- `node_modules/`
- `dist/` / `build/`
- `.env` 系列配置
- 常见缓存目录和临时文件

## 建议开发顺序

1. 先启动 `apis/`（确保数据库与环境变量可用）
2. 再启动 `admin/` 进行后台管理联调
3. 最后启动 `app/` 进行小程序联调

## 备注

- 若需要团队协作，建议在各子项目补充自己的 `README.md`（接口文档、环境变量说明、发布流程）。
- 如果你愿意，我可以继续帮你补一个 `.env.example` 模板（按 `apis/` 实际字段生成）。
