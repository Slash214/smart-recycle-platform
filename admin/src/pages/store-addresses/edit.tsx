import { Edit, useForm } from "@refinedev/antd";
import { Form, Input, InputNumber, Switch } from "antd";
import React from "react";
import { ImageUpload } from "../../components";

export const StoreAddressEdit = () => {
  const { formProps, saveButtonProps, query } = useForm({});

  React.useEffect(() => {
    if (query?.data?.data && formProps.form) {
      const data = query.data.data;
      const form = formProps.form;

      setTimeout(() => {
        form.setFieldsValue({
          ...data,
          status: data.status === 1,
          defaultAddress: data.defaultAddress === 1,
        });
      }, 100);
    }
  }, [query?.data?.data, formProps.form]);

  return (
    <Edit saveButtonProps={saveButtonProps}>
      <Form
        {...formProps}
        layout="vertical"
        onFinish={(values: any) => {
          const submitData = {
            ...values,
            status: values.status ? 1 : 0,
            defaultAddress: values.defaultAddress ? 1 : 0,
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item label={"ID"} name={["id"]} rules={[{ required: true }]} hidden>
          <Input readOnly />
        </Form.Item>

        <Form.Item label={"门店名称/联系人"} name={["user"]} rules={[{ required: true, message: "请输入门店名称/联系人" }]}>
          <Input placeholder="如：数码网·南山店" />
        </Form.Item>

        <Form.Item label={"微信号"} name={["wechat"]} rules={[{ required: true, message: "请输入微信号" }]}>
          <Input placeholder="请输入微信号" />
        </Form.Item>

        <Form.Item label={"区域地址"} name={["address"]} rules={[{ required: true, message: "请输入区域地址" }]}>
          <Input placeholder="如：广东省深圳市南山区" />
        </Form.Item>

        <Form.Item label={"详细地址"} name={["fullAddress"]} rules={[{ required: true, message: "请输入详细地址" }]}>
          <Input placeholder="如：科技园中区xx大厦1楼" />
        </Form.Item>

        <Form.Item label={"门店图片"} name={["img"]} rules={[{ required: true, message: "请上传门店图片" }]}>
          <ImageUpload />
        </Form.Item>

        <Form.Item label={"纬度"} name={["latitude"]}>
          <InputNumber placeholder="请输入纬度" style={{ width: "100%" }} precision={6} step={0.000001} />
        </Form.Item>

        <Form.Item label={"经度"} name={["longitude"]}>
          <InputNumber placeholder="请输入经度" style={{ width: "100%" }} precision={6} step={0.000001} />
        </Form.Item>

        <Form.Item label={"营业时间"} name={["busin"]} rules={[{ required: true, message: "请输入营业时间" }]}>
          <Input placeholder="例如：09:00-21:00" />
        </Form.Item>

        <Form.Item label={"联系电话"} name={["mobile"]} rules={[{ required: true, message: "请输入联系电话" }]}>
          <Input placeholder="请输入联系电话" />
        </Form.Item>

        <Form.Item label={"默认门店"} name={["defaultAddress"]} valuePropName="checked">
          <Switch checkedChildren="是" unCheckedChildren="否" />
        </Form.Item>

        <Form.Item label={"状态"} name={["status"]} valuePropName="checked" rules={[{ required: true, message: "请选择状态" }]}>
          <Switch checkedChildren="正常" unCheckedChildren="关闭" />
        </Form.Item>
      </Form>
    </Edit>
  );
};
