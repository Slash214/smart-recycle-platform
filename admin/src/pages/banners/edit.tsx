import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";
import React from "react";
import { ImageUpload } from "../../components";
import { normalizeImageKey } from "../../utils/image";

export const BannerEdit = () => {
  const { formProps, saveButtonProps, query } = useForm({
    // 数据转换：将完整URL转换为路径
    // 移除 queryOptions，使用 useEffect 处理数据转换
  });

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values: any) => {
          // 确保status是数字类型
          const submitData = {
            ...values,
            imgUrl: normalizeImageKey(values.imgUrl || ""),
            status: values.status ? 1 : 0,
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item
          label={"轮播图"}
          name="imgUrl"
          rules={[
            {
              required: true,
              message: "请上传轮播图",
            },
          ]}
        >
          <ImageUpload />
        </Form.Item>

        <Form.Item
          label={"标题文案"}
          name="text"
          rules={[
            {
              max: 255,
              message: "标题最多255个字符",
            },
          ]}
        >
          <Input placeholder="请输入标题文案（可选）" maxLength={255} showCount />
        </Form.Item>

        <Form.Item
          label={"跳转链接"}
          name="link"
          rules={[
            {
              type: "url",
              message: "请输入有效的URL地址",
            },
            {
              max: 255,
              message: "链接最多255个字符",
            },
          ]}
        >
          <Input placeholder="https://example.com/target（可选）" />
        </Form.Item>

        <Form.Item
          label={"状态"}
          name="status"
          valuePropName="checked"
          getValueFromEvent={(checked) => (checked ? 1 : 0)}
          getValueProps={(value) => ({ checked: value === 1 })}
        >
          <Switch checkedChildren="正常" unCheckedChildren="关闭" />
        </Form.Item>
      </Form>
    </Edit>
  );
};

