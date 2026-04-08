import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Select, InputNumber, Button, Space } from "antd";
import { PlusOutlined, MinusCircleOutlined } from "@ant-design/icons";
import React from "react";

export const OrderCreate = () => {
  const { formProps, saveButtonProps } = useForm({});

  return (
    <Create saveButtonProps={saveButtonProps}>
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={(values: any) => {
          const submitData = {
            ...values,
            nums: Number(values.nums || 0),
            type: Number(values.type || 1),
            status: Number(values.status || 1),
            remark_images: Array.isArray(values.remark_images) ? values.remark_images : [],
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item
          label={"联系电话"}
          name={["phone"]}
          rules={[
            {
              required: true,
              message: "请输入联系电话",
            },
            {
              pattern: /^1[3-9]\d{9}$/,
              message: "请输入正确的手机号格式",
            },
          ]}
        >
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item
          label={"数量"}
          name={["nums"]}
          rules={[
            {
              required: true,
              message: "请输入数量",
            },
          ]}
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="请输入数量" />
        </Form.Item>

        <Form.Item
          label={"类型"}
          name={["type"]}
          initialValue={1}
          rules={[{ required: true, message: "请选择类型" }]}
        >
          <Select
            placeholder="请选择类型"
            options={[
              { value: 1, label: "上门" },
              { value: 2, label: "邮寄" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={"收货方式"}
          name={["way"]}
        >
          <Input placeholder="请输入收货方式" />
        </Form.Item>

        <Form.Item
          label={"快递单号"}
          name={["tracking_number"]}
        >
          <Input placeholder="请输入快递单号" />
        </Form.Item>

        <Form.Item
          label={"快递公司"}
          name={["express_company"]}
        >
          <Input placeholder="请输入快递公司" />
        </Form.Item>

        <Form.Item
          label={"状态"}
          name={["status"]}
          initialValue={1}
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select
            placeholder="请选择状态"
            options={[
              { value: 1, label: "待处理" },
              { value: 2, label: "运输中" },
              { value: 3, label: "完成" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={"备注"}
          name={["remark"]}
        >
          <Input.TextArea placeholder="请输入备注信息" rows={4} />
        </Form.Item>

        <Form.Item label={"备注图片"} name={["remark_images"]} initialValue={[]}>
          <Form.List name={["remark_images"]}>
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                    <Form.Item
                      {...restField}
                      name={[name]}
                      rules={[{ required: true, message: "请输入图片URL" }]}
                    >
                      <Input placeholder="https://..." style={{ width: 500 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Form.Item>
                  <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                    添加图片URL
                  </Button>
                </Form.Item>
              </>
            )}
          </Form.List>
        </Form.Item>
      </Form>
    </Create>
  );
};
