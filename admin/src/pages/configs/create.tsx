import { Create, useForm } from "@refinedev/antd";
import { Form, Input, Switch } from "antd";
import React from "react";
import { RichTextEditor } from "../../components/rich-text-editor";

const { TextArea } = Input;

export const ConfigCreate = () => {
  const { formProps, saveButtonProps } = useForm({
    resource: "configs",
  });

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
          };
          return formProps.onFinish?.(submitData);
        }}
      >
        <Form.Item
          label={"配置名称"}
          name={["name"]}
          initialValue="default"
          rules={[
            {
              max: 100,
              message: "配置名称最大长度为100字符",
            },
          ]}
        >
          <Input placeholder="请输入配置名称（默认：default）" />
        </Form.Item>

        <Form.Item
          label={"客服电话"}
          name={["servicePhone"]}
          rules={[
            {
              max: 50,
              message: "客服电话最大长度为50字符",
            },
          ]}
        >
          <Input placeholder="请输入客服电话（可选）" />
        </Form.Item>

        <Form.Item
          label={"联系微信"}
          name={["contactWechat"]}
          rules={[
            {
              max: 100,
              message: "联系微信最大长度为100字符",
            },
          ]}
        >
          <Input placeholder="请输入联系微信（可选）" />
        </Form.Item>

        <Form.Item
          label={"默认收货地址"}
          name={["defaultAddress"]}
          rules={[
            {
              max: 500,
              message: "默认收货地址最大长度为500字符",
            },
          ]}
        >
          <TextArea
            placeholder="请输入默认收货地址（可选）"
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item
          label={"默认收货地址联系人"}
          name={["defaultContactName"]}
          rules={[
            {
              max: 100,
              message: "联系人最大长度为100字符",
            },
          ]}
        >
          <Input placeholder="请输入默认收货地址联系人（可选）" />
        </Form.Item>

        <Form.Item
          label={"默认收货地址联系方式"}
          name={["defaultContactPhone"]}
          rules={[
            {
              max: 50,
              message: "联系方式最大长度为50字符",
            },
          ]}
        >
          <Input placeholder="请输入默认收货地址联系方式（可选）" />
        </Form.Item>

        <Form.Item
          label={"备注说明"}
          name={["remark"]}
          rules={[
            {
              max: 500,
              message: "备注说明最大长度为500字符",
            },
          ]}
        >
          <TextArea
            placeholder="请输入备注说明（可选）"
            rows={3}
            showCount
            maxLength={500}
          />
        </Form.Item>

        <Form.Item label={"用户协议"} name={["userAgreement"]}>
          <RichTextEditor height={360} />
        </Form.Item>

        <Form.Item label={"隐私政策"} name={["privacyPolicy"]}>
          <RichTextEditor height={360} />
        </Form.Item>

        <Form.Item
          label={"状态"}
          name={["status"]}
          valuePropName="checked"
          initialValue={true}
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Switch
            checkedChildren="启用"
            unCheckedChildren="停用"
            defaultChecked
          />
        </Form.Item>
      </Form>
    </Create>
  );
};

