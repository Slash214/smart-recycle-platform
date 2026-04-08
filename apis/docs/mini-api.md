# 小程序端接口文档（Fastify v1）

## 基础信息

- Base URL: `http://localhost:3100/api/v1`
- 小程序用户态 token: 登录后使用 `data.token`
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

## 1. 默认静默登录（必接）

### 接口
- `POST /mini/auth/silent-login`
- 鉴权: 否

### 请求体

```json
{
  "code": "wx.login 返回的 code"
}
```

### 成功返回

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

---

## 2. 首页轮播图

### 接口
- `GET /mini/banners?page=1&pageSize=10`
- 鉴权: 否

### 参数
- `page`：页码（默认 1）
- `pageSize`：每页条数（默认 10）

### 返回
- `data`：轮播图数组
- `meta`：分页信息

---

## 3. 类目+品牌（推荐主接口）

> 用于首页类目和品牌联动渲染，后端已排序，前端拿到直接渲染。

### 接口
- `GET /mini/type-brands`
- `GET /mini/type-brands?ptypeId=1`
- 鉴权: 否

### 参数
- `ptypeId`：可选，一级类目 ID；不传返回全部类目树

### 返回结构
- `selectedPtypeId`：当前选中的一级类目（不传时为 0）
- `categories`：类目树（每个类目带 brands 数组）

示例:

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "selectedPtypeId": 0,
    "categories": [
      {
        "id": 1,
        "typeName": "Phone",
        "orderNo": 1,
        "brands": [
          {
            "id": 1,
            "brand": "热门老年机",
            "logo": "1775632845090_g3fy2z.jpg",
            "ptypeId": 1,
            "orderNum": 1,
            "updateinfo": 0
          }
        ]
      }
    ]
  }
}
```

---

## 4. 默认门店地址（必接）

> 用于小程序默认展示“门店地址/营业时间/电话”。

### 接口
- `GET /mini/default-address`
- 鉴权: 否

### 逻辑
- 优先返回 `defaultAddress=1 且 status=1` 的门店
- 无默认门店时返回第一条 `status=1` 门店
- 都没有时返回 `data: null`

### 返回字段
- `id`
- `user`
- `wechat`
- `address`
- `fullAddress`
- `img`
- `latitude`
- `longitude`
- `busin`
- `mobile`
- `status`
- `defaultAddress`

---

## 5. 兼容接口（可选）

### 类目与品牌（旧版平铺）
- `GET /mini/categories?ptypeId=1`
- 返回:
  - `types`: 一级类目列表
  - `brands`: 当前筛选下品牌列表（平铺）

> 建议优先使用 `type-brands`，更适合前端直接渲染。

---

## 6. 品牌详情图片（小程序渲染用）

### 接口
- `GET /mini/brands/:id/images`
- 鉴权: 否

示例:
- `GET /mini/brands/1/images`

### 返回

```json
{
  "code": 200,
  "message": "ok",
  "data": {
    "brandId": 1,
    "imageUrls": [
      "https://img.shumahuishou.com/detail/a.jpg",
      "https://img.shumahuishou.com/detail/b.jpg"
    ]
  }
}
```

说明:
- 图片来自品牌详情表 `details.image_urls`
- 若无详情或无图片，返回 `imageUrls: []`

---

## 7. 小程序订单接口

> 需要登录后访问，Header: `Authorization: Bearer <token>`

状态定义:
- `1`: 待确认
- `2`: 进行中
- `3`: 已完成

### 7.1 创建订单
- `POST /orders`

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
  "remark": "备注信息",
  "remark_images": [
    "https://img.example.com/order/r1.jpg"
  ]
}
```

说明:
- `express_company`：快递公司字符串
- `remark_images`：备注图片数组
- `userid` 后端自动从 token 获取

### 7.2 我的订单列表
- `GET /orders?page=1&pageSize=20&status=1`
- 仅返回当前登录用户订单

### 7.3 订单详情
- `GET /orders/:id`
- 仅可查看自己的订单
