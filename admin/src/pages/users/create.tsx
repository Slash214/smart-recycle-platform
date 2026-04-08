import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, Switch } from "antd";
import React from "react";

export const UserCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values: any) => {
          // 将Switch的boolean值转换为1/0
          const submitData = {
            ...values,
            status: values.status ? 1 : 0,
            // 确保level有默认值
            level: values.level || "",
            // 确保mobile有默认值
            mobile: values.mobile || "",
            // 确保avatar有默认值
            avatar: values.avatar || "",
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item
          label={"OpenID"}
          name={["openid"]}
          rules={[
            {
              required: true,
              message: "请输入OpenID",
            },
            {
              max: 100,
              message: "OpenID最大长度为100",
            },
          ]}
        >
          <Input placeholder="请输入OpenID" />
        </Form.Item>

        <Form.Item
          label={"用户名"}
          name={["userName"]}
          rules={[
            {
              required: true,
              message: "请输入用户名",
            },
            {
              max: 50,
              message: "用户名最大长度为50",
            },
          ]}
        >
          <Input placeholder="请输入用户名" />
        </Form.Item>

        <Form.Item
          label={"手机号"}
          name={["mobile"]}
          rules={[
            {
              pattern: /^1[3-9]\d{9}$/,
              message: "请输入正确的手机号格式",
            },
          ]}
        >
          <Input placeholder="请输入手机号" />
        </Form.Item>

        <Form.Item
          label={"头像URL"}
          name={["avatar"]}
          rules={[
            {
              type: "url",
              message: "请输入有效的URL地址",
            },
            {
              max: 255,
              message: "头像URL最大长度为255",
            },
          ]}
        >
          <Input placeholder="请输入头像URL" />
        </Form.Item>

        <Form.Item
          label={"等级"}
          name={["level"]}
        >
          <Select
            placeholder="请选择等级"
            allowClear
            options={[
              { value: "普通", label: "普通" },
              { value: "VIP", label: "VIP" },
              { value: "SVIP", label: "SVIP" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={"状态"}
          name={["status"]}
          valuePropName="checked"
          initialValue={true}
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Switch
            checkedChildren="正常"
            unCheckedChildren="关闭"
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Create>
  );
};
