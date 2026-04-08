# 管理员端接口文档（Fastify v1）

## 基础信息

- Base URL: `http://localhost:3100/api/v1`
- 认证方式: `Authorization: Bearer <admin-token>`
- 返回结构:

```json
{
  "code": 200,
  "message": "ok",
  "data": {},
  "meta": {}
}
```

---

## 1. 认证模块

### 1.1 管理员登录
- `POST /auth/admin/login`
- 鉴权: 否

请求体:

```json
{
  "username": "admin",
  "password": "12345678"
}
```

成功返回:

```json
{
  "code": 200,
  "message": "管理员登录成功",
  "data": {
    "token": "jwt-token",
    "admin": {
      "id": 1,
      "username": "admin",
      "status": 1
    }
  }
}
```

### 1.2 管理员修改密码
- `PUT /auth/admin/password`
- 鉴权: 是

请求体:

```json
{
  "oldPassword": "12345678",
  "newPassword": "newpass123"
}
```

---

## 2. 品牌管理

> 已升级为一级类目关联，品牌接口统一使用 `ptypeId`，不再使用 `type/typeId`。

### 2.1 品牌列表
- `GET /brands?page=1&pageSize=10&ptypeId=1&status=1`
- 鉴权: 否（管理端一般会带 token 访问）

参数:
- `page`: 页码，从 1 开始
- `pageSize`: 每页条数
- `ptypeId`: 一级类目ID（可选）
- `status`: 状态（可选，1 正常，0 关闭）

### 2.2 品牌详情
- `GET /brands/:id`

### 2.3 新增品牌
- `POST /brands`
- 鉴权: 是

请求体（`ptypeId` 必填）:

```json
{
  "brand": "华为",
  "logo": "https://img.example.com/huawei.jpg",
  "ptypeId": 1,
  "orderNum": 100,
  "status": 1,
  "updateinfo": 0
}
```

### 2.4 编辑品牌
- `PUT /brands/:id`
- 鉴权: 是

### 2.5 删除品牌（软删）
- `DELETE /brands/:id`
- 鉴权: 是

### 2.6 品牌详情（富文本+图片）

#### 详情分页列表
- `GET /brand-details?page=1&pageSize=10&brandId=1`

#### 单品牌详情
- `GET /brands/:id/details`

#### 新增/更新详情（一品牌一详情）
- `PUT /brands/:id/details`
- 鉴权: 是

请求体（推荐）:

```json
{
  "content": "<p>图文详情（可为空）</p>",
  "imageUrls": [
    "https://img.example.com/detail-1.jpg",
    "https://img.example.com/detail-2.jpg"
  ]
}
```

说明:
- `content` 和 `imageUrls` 不允许同时为空
- `imageUrls` 为数组，后端存储到 `details.image_urls`

---

## 3. 一级类目（ptype）管理

### 3.1 类目列表
- `GET /types`

### 3.2 新增类目
- `POST /types`
- 鉴权: 是

请求体:

```json
{
  "typeName": "手机",
  "orderNo": 1,
  "status": 1
}
```

### 3.3 编辑类目
- `PUT /types/:id`
- 鉴权: 是

### 3.4 删除类目
- `DELETE /types/:id`
- 鉴权: 是

---

## 4. 门店地址管理

### 4.1 列表
- `GET /addresses?page=1&pageSize=10&status=1`

### 4.2 详情
- `GET /addresses/:id`

### 4.3 新增
- `POST /addresses`
- 鉴权: 是

请求体（必填字段）:

```json
{
  "user": "数码网·南山店",
  "wechat": "smw_nanshan",
  "address": "广东省深圳市南山区",
  "fullAddress": "科技园中区xx大厦1楼",
  "img": "https://img.example.com/store.jpg",
  "busin": "09:00-21:00",
  "mobile": "13800138000",
  "latitude": 22.540503,
  "longitude": 113.934528,
  "status": 1,
  "defaultAddress": 1
}
```

### 4.4 编辑
- `PUT /addresses/:id`
- 鉴权: 是

### 4.5 删除（软删）
- `DELETE /addresses/:id`
- 鉴权: 是

---

## 5. 轮播图管理

### 5.1 列表
- `GET /banners?page=1&pageSize=10&status=1`

### 5.2 新增
- `POST /banners`（鉴权: 是）

### 5.3 编辑
- `PUT /banners/:id`（鉴权: 是）

### 5.4 删除（软删）
- `DELETE /banners/:id`（鉴权: 是）

---

## 5.1 系统配置（协议内容）

### 列表/详情
- `GET /configs?page=1&pageSize=20`
- `GET /configs/:id`

### 新增/编辑
- `POST /configs`（鉴权: 是）
- `PUT /configs/:id`（鉴权: 是）

关键字段：
- `userAgreement`：用户协议（富文本 HTML）
- `privacyPolicy`：隐私政策（富文本 HTML）
- `status`：1启用 0停用

---

## 6. 订单管理

- 状态定义（新）：
  - `inbound_status`: `10待入库 20已入库`
  - `settlement_status`: `10待报价 20已报价 30待结算 40已结算 50退货中`
- 兼容旧字段：
  - `status`: `1待确认 2进行中 3已完成`

### 6.1 订单列表
- `GET /orders?page=1&pageSize=20&inbound_status=10&settlement_status=10&type=2&keyword=顺丰`
- 鉴权: 是
- 说明: 管理员可查看全部订单，小程序用户仅返回自己的订单

参数（可选）:
- `page`、`pageSize`
- `inbound_status`：`10/20`
- `settlement_status`：`10/20/30/40/50`
- `status`：`1/2/3`（兼容）
- `type`：`1上门 2邮寄`
- `way`：收货方式
- `userid`：用户ID（管理员可用）
- `keyword`：手机号/快递单号/快递公司/备注
- `startAt`、`endAt`：按创建时间筛选（ISO 字符串）

### 6.2 订单详情
- `GET /orders/:id`（鉴权: 是）

### 6.3 创建订单
- `POST /orders`（鉴权: 是）

请求体示例:

```json
{
  "nums": 1,
  "price": "100",
  "phone": "153289842222",
  "type": 2,
  "way": 2,
  "areas": "深圳市南山区",
  "hourse_number": "xx大厦1楼",
  "tracking_number": "SF123456789",
  "express_company": "顺丰",
  "remark": "上门前联系",
  "remark_images": [
    "https://img.example.com/order/r1.jpg"
  ],
  "status": 1
}
```

说明:
- `express_company` 为字符串存储
- `remark_images` 返回为数组，数据库内部存 JSON 字符串
- 小程序端不传 `userid`，后端自动取 token 中 `uid`

### 6.4 更新订单
- `PUT /orders/:id`（鉴权: 是）

### 6.5 删除订单（软删）
- `DELETE /orders/:id`（鉴权: 是）
- 实际会将 `status` 置为 `0`

---

## 7. 小程序用户统计（管理端仪表盘）

### 小程序用户统计
- `GET /admin/stats/mini-users`
- 鉴权: 是（管理员 token）

返回示例:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "totalUsers": 1200,
    "activeUsers": 1180,
    "todayNewUsers": 35,
    "totalOrders": 560,
    "todayOrders": 12,
    "viewedBrandCount": 320
  }
}
```

---

## 8. 仪表盘总览数据（管理端首页）

### 仪表盘统计
- `GET /admin/stats/dashboard`
- 鉴权: 是（管理员 token）

返回示例:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "totalUsers": 1200,
    "totalMiniUsers": 900,
    "todayNewUsers": 35,
    "totalOrders": 560,
    "todayOrders": 12,
    "totalBrands": 120,
    "totalPhones": 680,
    "totalBanners": 5,
    "totalAddresses": 8,
    "totalHelps": 20,
    "viewedBrandCount": 320
  }
}
```

---

## 9. 用户管理（管理端）

### 9.1 用户列表
- `GET /admin/users?page=1&pageSize=20&platform=WECHAT&status=1&keyword=张三`
- 鉴权: 是

参数:
- `page`、`pageSize`
- `platform`（可选）
- `status`（可选，0/1）
- `keyword`（可选，匹配用户名/手机号/openid）

### 9.2 用户详情
- `GET /admin/users/:id`
- 鉴权: 是

### 9.3 更新用户信息
- `PUT /admin/users/:id`
- 鉴权: 是

请求体示例:

```json
{
  "userName": "新昵称",
  "mobile": "13800138000",
  "avatar": "https://img.example.com/avatar.jpg",
  "level": "vip"
}
```

### 9.4 启用/禁用用户
- `PUT /admin/users/:id/status`
- 鉴权: 是

请求体:

```json
{
  "status": 0
}
```

---

## 10. 上传接口（七牛）

### 上传图片
- `POST /files/images`
- 鉴权: 是
- Content-Type: `multipart/form-data`
- 字段: `file`

返回:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "key": "1711111111_abcd12.jpg",
    "url": "https://img.example.com/1711111111_abcd12.jpg",
    "raw": {}
  }
}
```
