import { Create, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch } from "antd";
import React from "react";

export const ProductTypeCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values: any) => {
          const submitData = {
            ...values,
            status: values.status ? 1 : 0,
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item
          label={"类型名称"}
          name={["typeName"]}
          rules={[
            {
              required: true,
              message: "请输入类型名称",
            },
            {
              max: 100,
              message: "类型名称最大长度为100",
            },
          ]}
        >
          <Input placeholder="请输入类型名称" />
        </Form.Item>

        <Form.Item
          label={"排序"}
          name={["orderNo"]}
          initialValue={1}
          rules={[
            {
              required: true,
              message: "请输入排序号",
            },
          ]}
        >
          <InputNumber
            placeholder="请输入排序号"
            min={1}
            max={9999}
            style={{ width: "100%" }}
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
