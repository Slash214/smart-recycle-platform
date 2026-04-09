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
        initialValues={{
          devices: [{ model: "", memory: "", unit: "whole", qty: 1 }],
        }}
        onFinish={(values: any) => {
          const deviceRows = Array.isArray(values.devices)
            ? values.devices
                .filter((d: { model?: string }) => d && String(d.model || "").trim())
                .map((d: { model?: string; memory?: string; unit?: string; qty?: number }) => ({
                  model: String(d.model || "").trim(),
                  memory: String(d.memory || "").trim(),
                  unit: d.unit === "board" ? "board" : "whole",
                  qty: Number(d.qty) || 0,
                }))
            : [];
          const numsFromDevices = deviceRows.length > 0 ? deviceRows.reduce((s: number, d: { qty: number }) => s + d.qty, 0) : Number(values.nums || 0);
          const submitData = {
            ...values,
            nums: numsFromDevices,
            type: Number(values.type || 1),
            way: Number(values.way || 1),
            status: Number(values.status || 10),
            remark_images: Array.isArray(values.remark_images) ? values.remark_images : [],
            devices: deviceRows,
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
          extra="填写回收明细后将按明细数量汇总；也可只填数量、不填明细"
        >
          <InputNumber min={1} style={{ width: "100%" }} placeholder="请输入数量" />
        </Form.Item>

        <Form.Item label="回收明细（可选）">
          <Form.List name="devices">
            {(fields, { add, remove }) => (
              <>
                {fields.map(({ key, name, ...restField }) => (
                  <Space key={key} wrap style={{ marginBottom: 8 }} align="start">
                    <Form.Item {...restField} name={[name, "model"]}>
                      <Input placeholder="机型" style={{ width: 120 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "memory"]}>
                      <Input placeholder="内存" style={{ width: 100 }} />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "unit"]} initialValue="whole">
                      <Select
                        style={{ width: 100 }}
                        options={[
                          { value: "whole", label: "整机" },
                          { value: "board", label: "单板" },
                        ]}
                      />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "qty"]}>
                      <InputNumber min={1} style={{ width: 90 }} placeholder="数量" />
                    </Form.Item>
                    <Form.Item {...restField} name={[name, "price"]}>
                      <Input placeholder="单项价格" style={{ width: 110 }} />
                    </Form.Item>
                    <MinusCircleOutlined onClick={() => remove(name)} />
                  </Space>
                ))}
                <Button type="dashed" onClick={() => add({ model: "", memory: "", unit: "whole", qty: 1 })} block icon={<PlusOutlined />}>
                  添加明细行
                </Button>
              </>
            )}
          </Form.List>
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

        <Form.Item noStyle shouldUpdate={(prev, cur) => prev.way !== cur.way}>
          {({ getFieldValue }) => {
            const way = Number(getFieldValue("way") || 1);
            if (way === 1) {
              return (
                <Form.Item
                  label="微信收款账号"
                  name={["wechat_account"]}
                  rules={[{ required: true, message: "请输入微信收款账号" }]}
                >
                  <Input placeholder="微信号或绑定手机号" />
                </Form.Item>
              );
            }
            if (way === 2) {
              return (
                <Form.Item
                  label="支付宝账号"
                  name={["alipay_account"]}
                  rules={[{ required: true, message: "请输入支付宝账号" }]}
                >
                  <Input placeholder="支付宝账号" />
                </Form.Item>
              );
            }
            return (
              <>
                <Form.Item
                  label="收款人姓名"
                  name={["payee_name"]}
                  rules={[{ required: true, message: "请输入收款人姓名" }]}
                >
                  <Input placeholder="持卡人姓名" />
                </Form.Item>
                <Form.Item
                  label="开户行"
                  name={["bank_name"]}
                  rules={[{ required: true, message: "请输入开户行" }]}
                >
                  <Input placeholder="银行名称" />
                </Form.Item>
                <Form.Item
                  label="银行卡号"
                  name={["bank_card_no"]}
                  rules={[{ required: true, message: "请输入银行卡号" }]}
                >
                  <Input placeholder="银行卡号" />
                </Form.Item>
              </>
            );
          }}
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
          label={"订单状态"}
          name={["status"]}
          initialValue={10}
          rules={[{ required: true, message: "请选择订单状态" }]}
        >
          <Select
            placeholder="请选择订单状态"
            options={[
              { value: 10, label: "已下单" },
              { value: 20, label: "已签收" },
              { value: 30, label: "已报价" },
              { value: 40, label: "已确认" },
              { value: 50, label: "已返款" },
              { value: 60, label: "已完成" },
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
