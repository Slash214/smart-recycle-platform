# ImageUpload 图片上传组件

一个功能完整、易于使用的图片上传组件，集成了七牛云图片上传功能。

## ✨ 特性

- 📸 支持单张图片上传
- 🖼 实时图片预览
- 🗑 一键删除图片
- 📏 文件大小和格式验证
- 🎨 美观的 UI 设计
- 🔄 上传进度提示
- ✅ 无缝集成 Ant Design Form

## 📦 安装

组件已经包含在项目中，无需额外安装。

## 🚀 基础用法

### 在 Form 表单中使用

```tsx
import { Form } from 'antd';
import { ImageUpload } from '../../components';

<Form.Item
  label="图片"
  name="imgUrl"
  rules={[
    {
      required: true,
      message: "请上传图片",
    },
  ]}
>
  <ImageUpload />
</Form.Item>
```

### 完整示例

```tsx
import React from 'react';
import { Form, Button } from 'antd';
import { ImageUpload } from '../../components';

export const MyComponent = () => {
  const [form] = Form.useForm();

  const onFinish = (values: any) => {
    console.log('图片URL:', values.imgUrl);
    // 提交到后端...
  };

  return (
    <Form form={form} onFinish={onFinish}>
      <Form.Item
        label="商品图片"
        name="imgUrl"
        rules={[{ required: true, message: '请上传图片' }]}
      >
        <ImageUpload />
      </Form.Item>

      <Form.Item>
        <Button type="primary" htmlType="submit">
          提交
        </Button>
      </Form.Item>
    </Form>
  );
};
```

## 🎛 Props 属性

| 属性 | 类型 | 默认值 | 说明 |
|------|------|--------|------|
| `value` | `string` | - | 图片 URL（由 Form.Item 自动管理） |
| `onChange` | `(url: string) => void` | - | 值变化回调（由 Form.Item 自动调用） |
| `onKeyChange` | `(key: string) => void` | - | 图片 key 变化回调（用于删除功能） |
| `maxSize` | `number` | `10` | 最大文件大小（MB） |
| `accept` | `string` | `'image/jpg,image/jpeg,image/png,image/gif,image/webp'` | 接受的文件类型 |
| `disabled` | `boolean` | `false` | 是否禁用 |

## 📝 高级用法

### 保存图片 Key 用于删除

```tsx
import React, { useState } from 'react';
import { ImageUpload } from '../../components';

export const MyComponent = () => {
  const [imageKey, setImageKey] = useState('');

  const handleDelete = async () => {
    if (imageKey) {
      // 调用删除 API
      const encodedKey = encodeURIComponent(imageKey);
      await fetch(`http://localhost:3000/v1/upload/image/${encodedKey}`, {
        method: 'DELETE'
      });
    }
  };

  return (
    <Form.Item name="imgUrl" label="图片">
      <ImageUpload onKeyChange={setImageKey} />
    </Form.Item>
  );
};
```

### 自定义文件大小限制

```tsx
<Form.Item name="avatar" label="用户头像">
  <ImageUpload maxSize={2} /> {/* 限制 2MB */}
</Form.Item>
```

### 禁用上传

```tsx
<Form.Item name="imgUrl" label="图片">
  <ImageUpload disabled={true} />
</Form.Item>
```

## 🎨 组件界面

### 未上传状态
显示一个虚线框上传区域，带有上传图标和"上传图片"文字。

### 上传中
显示加载动画和"上传中..."文字。

### 已上传状态
- 显示上传的图片
- 右上角有"预览"和"删除"按钮
- 点击预览可以全屏查看图片
- 点击删除可以移除图片

## 🔧 技术细节

### 上传流程

1. 用户选择图片文件
2. 组件进行前端验证（格式、大小）
3. 使用 FormData 将文件上传到七牛云
4. 服务器返回图片 URL 和相关信息
5. 组件自动更新预览并触发 Form 的 onChange

### API 集成

组件使用以下 API：

**上传图片**
```
POST http://localhost:3000/v1/upload/image
Content-Type: multipart/form-data
```

**返回数据**
```json
{
  "url": "http://xxx.clouddn.com/xxx.webp",
  "key": "xxx.webp",
  "hash": "xxx",
  "size": 12345,
  "originalName": "photo.jpg",
  "processedName": "photo-timestamp.webp"
}
```

### 图片处理

服务器会自动：
- 转换为 WebP 格式（优化性能）
- 压缩质量至 85%
- 限制最大尺寸为 2000x2000px
- 自动旋转（根据 EXIF）

## 🛡 错误处理

组件会自动处理以下错误：

- ❌ 文件类型不支持 → 提示"只能上传图片文件！"
- ❌ 文件太大 → 提示"图片大小不能超过 XXMB！"
- ❌ 上传失败 → 显示服务器返回的错误信息

## 🌐 浏览器支持

- Chrome（推荐）
- Firefox
- Safari
- Edge

## 💡 最佳实践

### 1. 在创建页面使用

```tsx
export const BannerCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="轮播图"
          name="imgUrl"
          rules={[{ required: true, message: "请上传轮播图" }]}
        >
          <ImageUpload />
        </Form.Item>
        {/* 其他表单项... */}
      </Form>
    </Create>
  );
};
```

### 2. 在编辑页面使用

```tsx
export const BannerEdit = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form {...formProps} layout="vertical">
        <Form.Item
          label="轮播图"
          name="imgUrl"
          rules={[{ required: true, message: "请上传轮播图" }]}
        >
          <ImageUpload />
        </Form.Item>
        {/* 其他表单项... */}
      </Form>
    </Edit>
  );
};
```

**注意**: Refine 的 `useForm` 会自动加载数据并填充到表单，因此编辑时会自动显示已上传的图片。

## 🔍 调试

如果遇到问题，请检查：

1. ✅ 后端服务是否运行在 `http://localhost:3000`
2. ✅ 上传接口 `/v1/upload/image` 是否可用
3. ✅ 七牛云配置是否正确
4. ✅ 查看浏览器控制台的网络请求和错误信息

## 📄 相关文件

- 组件源码: `src/components/image-upload/index.tsx`
- 使用示例: `src/pages/banners/create.tsx`
- 使用示例: `src/pages/banners/edit.tsx`

## 🎉 完成！

现在你可以在项目的任何地方使用 `<ImageUpload />` 组件了！

