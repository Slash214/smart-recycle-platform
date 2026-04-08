# 回收数码 API 对接文档（Fastify / v1）

## 基础信息

- Base URL: `http://{host}:{port}/api/v1`
- 鉴权方式: `Authorization: Bearer <JWT>`
- 响应格式统一:

```json
{
  "code": 200,
  "message": "ok",
  "data": {},
  "meta": {}
}
```

## 错误码约定

- `40001`: 参数错误
- `40101`: 未授权或登录过期
- `40404`: 资源不存在
- `500xx`: 服务端错误

## 认证模块

### 1) 用户登录
- `POST /auth/login`
- 鉴权: 否
- Body:

```json
{
  "openid": "wx_openid_xxx",
  "platform": "WECHAT",
  "userName": "张三"
}
```

### 2) 管理员登录
- `POST /auth/admin/login`
- 鉴权: 否
- Body:

```json
{
  "username": "admin",
  "password": "12345678"
}
```

- Response:

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

- 失败示例:

```json
{
  "code": 40102,
  "message": "账号或密码错误",
  "data": null
}
```

### 3) 管理员修改密码
- `PUT /auth/admin/password`
- 鉴权: 是（`Authorization: Bearer <admin-token>`）
- Body:

```json
{
  "oldPassword": "12345678",
  "newPassword": "newpass123"
}
```

## 小程序接口（首页）

### 1) 默认静默登录（获取用户基本信息）
- `POST /mini/auth/silent-login`
- 鉴权: 否
- Body:

```json
{
  "code": "wx.login 返回的 code"
}
```

- Response:

```json
{
  "code": 200,
  "message": "静默登录成功",
  "data": {
    "token": "jwt-token",
    "user": {
      "id": 1,
      "openid": "oabcxxx",
      "userName": "用户10001",
      "avatar": "",
      "mobile": "",
      "platform": "WECHAT"
    }
  }
}
```

### 2) 轮播图接口
- `GET /mini/banners?page=1&pageSize=10`
- 鉴权: 否
- Response:

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "imgUrl": "https://...",
      "text": "banner标题",
      "link": "https://...",
      "status": 1
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 2,
    "pages": 1
  }
}
```

### 3) 类目渲染接口（一级类目 + 品牌）
- `GET /mini/categories?ptypeId=1`
- 鉴权: 否
- 参数：
  - `ptypeId`: 一级类目ID（可选，不传返回全部品牌）
- Response:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "types": [
      {
        "id": 1,
        "typeName": "Phone",
        "orderNo": 1,
        "status": 1
      }
    ],
    "brands": [
      {
        "id": 1,
        "brand": "热门老年机",
        "logo": "xxx.webp",
        "ptypeId": 1,
        "orderNum": 1,
        "status": 1
      }
    ]
  }
}
```

- Response:

```json
{
  "code": 200,
  "message": "密码修改成功",
  "data": true
}
```

- 失败示例:

```json
{
  "code": 40002,
  "message": "旧密码错误",
  "data": null
}
```

## 手机模块

- `GET /phones` 列表（query: `page,pageSize,brandId,status`）
- `GET /phones/:id` 详情
- `POST /phones` 创建（需鉴权）
- `PUT /phones/:id` 更新（需鉴权）
- `DELETE /phones/:id` 删除（需鉴权，软删）

## 品牌模块

- `GET /brands` 列表（支持按一级类目筛选+分页，参数统一使用 `ptypeId`）
- `GET /brands/:id` 详情
- `POST /brands` 创建（需鉴权）
- `PUT /brands/:id` 更新（需鉴权）
- `DELETE /brands/:id` 删除（需鉴权）

### 品牌列表筛选与分页（管理端重点）
- 请求：`GET /brands?page=1&pageSize=10&ptypeId=1`
- 查询参数：
  - `page`: 页码（从 1 开始）
  - `pageSize`: 每页条数
  - `ptypeId`: 一级类目ID（`ptype.id`）
  - `status`: 可选（`1` 正常，`0` 关闭）
- 注意：品牌已改为关联一级类目，`type/typeId` 均不再使用

- Response:

```json
{
  "code": 200,
  "message": "ok",
  "data": [
    {
      "id": 1,
      "brand": "热门老年机",
      "ptypeId": 1,
      "status": 1
    }
  ],
  "meta": {
    "page": 1,
    "pageSize": 10,
    "total": 1,
    "pages": 1
  }
}
```

### 品牌详情
- `GET /brands/:id/details`
- `PUT /brands/:id/details`（需鉴权）

### 类型字典
- `GET /types`
- `POST /types`（需鉴权）
- `PUT /types/:id`（需鉴权）
- `DELETE /types/:id`（需鉴权）

### 用户浏览记录
- `POST /brands/viewed`（需鉴权）
- Body: `{ "userId": 1, "brandId": 1 }`

## 订单模块（需鉴权）

- `GET /orders` 列表（query: `page,pageSize,userid,type,status`）
- `GET /orders/:id` 详情
- `POST /orders` 创建
- `PUT /orders/:id` 更新
- `DELETE /orders/:id` 删除（软删）

## 通用内容模块

以下资源均支持标准 REST（列表/详情/创建/更新/删除）：

- `addresses`
- `banners`
- `helps`

示例：
- `GET /banners?page=1&pageSize=20`
- `POST /banners`（需鉴权）
- `PUT /banners/:id`（需鉴权）
- `DELETE /banners/:id`（需鉴权）

## 文件上传（七牛）

### 上传图片
- `POST /files/images`
- 鉴权: 是
- Content-Type: `multipart/form-data`
- 字段: `file`
- Response:

```json
{
  "code": 200,
  "message": "上传成功",
  "data": {
    "key": "1711111111_abcd12.jpg",
    "url": "https://cdn.example.com/1711111111_abcd12.jpg",
    "raw": {}
  }
}
```

## 旧接口到新接口映射（核心）

- `GET /phone/list` -> `GET /phones`
- `POST /phone/create` -> `POST /phones`
- `PUT /phone/fix` -> `PUT /phones/:id`
- `POST /phone/del` -> `DELETE /phones/:id`
- `GET /brand/list` -> `GET /brands`
- `POST /brand/create` -> `POST /brands`
- `PUT /brand/fix` -> `PUT /brands/:id`
- `POST /order/create` -> `POST /orders`
- `GET /order/list` -> `GET /orders`
- `POST /image/upload` -> `POST /files/images`

