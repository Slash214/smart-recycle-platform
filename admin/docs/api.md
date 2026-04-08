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

### 1) 登录
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

- Response:

```json
{
  "code": 200,
  "message": "登录成功",
  "data": {
    "token": "jwt-token",
    "user": {}
  }
}
```

## 手机模块

- `GET /phones` 列表（query: `page,pageSize,brandId,series,status`）
- `GET /phones/:id` 详情
- `GET /phones/search` 搜索（query: `keyword,page,pageSize`）
- `POST /phones` 创建（需鉴权）
- `PUT /phones/:id` 更新（需鉴权）
- `DELETE /phones/:id` 删除（需鉴权，软删）

## 品牌模块

- `GET /brands` 列表
- `GET /brands/:id` 详情
- `POST /brands` 创建（需鉴权）
- `PUT /brands/:id` 更新（需鉴权）
- `DELETE /brands/:id` 删除（需鉴权）

### 品牌详情
- `GET /brands/:id/details`
- `PUT /brands/:id/details`（需鉴权）

### 品牌系列
- `GET /brands/:id/series`
- `POST /brands/:id/series`（需鉴权）
- `PUT /brands/:id/series/:seriesId`（需鉴权）

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
- `searches`

示例：
- `GET /banners?page=1&pageSize=20`
- `POST /banners`（需鉴权）
- `PUT /banners/:id`（需鉴权）
- `DELETE /banners/:id`（需鉴权）

扩展接口：
- `GET /searches/hot` 热搜词

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

