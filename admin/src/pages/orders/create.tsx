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
            way: Number(values.way || 1),
            inbound_status: Number(values.inbound_status || 10),
            settlement_status: Number(values.settlement_status || 10),
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
          label={"报价金额"}
          name={["price"]}
          extra="当结算状态为已报价及之后时，建议填写报价金额"
        >
          <Input placeholder="请输入报价金额，如 199.00" />
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
          label={"收款方式"}
          name={["way"]}
          initialValue={1}
        >
          <Select
            placeholder="请选择收款方式"
            options={[
              { value: 1, label: "微信收款" },
              { value: 2, label: "支付宝收款" },
              { value: 3, label: "银行卡收款" },
            ]}
          />
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
          label={"入库状态"}
          name={["inbound_status"]}
          initialValue={10}
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Select
            placeholder="请选择状态"
            options={[
              { value: 10, label: "待入库" },
              { value: 20, label: "已入库" },
            ]}
          />
        </Form.Item>

        <Form.Item
          label={"结算状态"}
          name={["settlement_status"]}
          initialValue={10}
          rules={[{ required: true, message: "请选择结算状态" }]}
        >
          <Select
            placeholder="请选择结算状态"
            options={[
              { value: 10, label: "待报价" },
              { value: 20, label: "已报价" },
              { value: 30, label: "待结算" },
              { value: 40, label: "已结算" },
              { value: 50, label: "退货中" },
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
