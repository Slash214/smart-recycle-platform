import { useGetIdentity, useLogout } from "@refinedev/core";
import { Form, Input, Button, Card, Typography, Space, message, Modal } from "antd";
import { LockOutlined } from "@ant-design/icons";
import React from "react";
import { getAuthHeaders } from "../../utils/auth";
import { API_URL } from "../../constants/app";

const { Title, Text } = Typography;

export const ChangePassword = () => {
  const { data: identity } = useGetIdentity();
  const { mutate: logout } = useLogout();
  const [form] = Form.useForm();

  const isAdmin = identity?.username === "admin";

  const handleSubmit = async (values: { oldPassword: string; newPassword: string; confirmPassword?: string }) => {
    try {
      const response = await fetch(`${API_URL}/auth/admin/password`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          oldPassword: values.oldPassword,
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && (data.code === undefined || data.code === 200) && data.data === true) {
        message.success("密码修改成功，正在跳转登录页...");

        localStorage.removeItem("auth_token");
        localStorage.removeItem("auth_user");
        logout();

        setTimeout(() => {
          window.location.href = "/login";
        }, 500);
      } else {
        const errorMsg =
          typeof data.error === "string"
            ? data.error
            : data.error?.message || data.message || data.msg || "密码修改失败";
        Modal.error({
          title: "修改密码失败",
          content: errorMsg,
          okText: "知道了",
        });
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("修改密码失败:", error);
      }
      Modal.error({
        title: "网络错误",
        content: "请检查网络连接后重试，或联系系统管理员。",
        okText: "知道了",
      });
    }
  };

  if (isAdmin) {
    return (
      <Card>
        <Space direction="vertical" size="large" style={{ width: "100%" }}>
          <div>
            <Title level={3}>密码管理</Title>
            <Text type="secondary">超级管理员账号信息</Text>
          </div>
          
          <div style={{ 
            padding: "24px", 
            background: "#f5f5f5", 
            borderRadius: "8px",
            textAlign: "center" 
          }}>
            <LockOutlined style={{ fontSize: "48px", color: "#1890ff", marginBottom: "16px" }} />
            <div>
              <Title level={4} style={{ margin: 0 }}>超级管理员账号</Title>
              <Text type="secondary">
                超级管理员账号的密码无法通过此界面修改，请联系系统管理员。
              </Text>
            </div>
          </div>
        </Space>
      </Card>
    );
  }

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>修改密码</Title>
          <Text type="secondary">为了您的账户安全，请定期更换密码</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 400 }}
        >
          <Form.Item
            label="当前密码"
            name="oldPassword"
            rules={[
              { required: true, message: "请输入当前密码" },
              { min: 6, message: "密码至少6位" },
            ]}
          >
            <Input.Password
              placeholder="请输入当前密码"
              prefix={<LockOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="新密码"
            name="newPassword"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码至少6位" },
              {
                pattern: /[a-z]/,
                message: "密码必须包含至少一个小写字母",
              },
              {
                pattern: /[A-Z]/,
                message: "密码必须包含至少一个大写字母",
              },
              {
                pattern: /[@$!%*?&]/,
                message: "密码必须包含至少一个特殊字符 (@$!%*?&)",
              },
            ]}
          >
            <Input.Password
              placeholder="至少6位，含大小写字母和特殊字符@$!%*?&"
              prefix={<LockOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item
            label="确认新密码"
            name="confirmPassword"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请确认新密码" },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("newPassword") === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error("两次输入的密码不一致"));
                },
              }),
            ]}
          >
            <Input.Password
              placeholder="请再次输入新密码"
              prefix={<LockOutlined />}
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              size="large"
              block
              style={{
                background: "#1890ff",
                borderColor: "#1890ff",
              }}
            >
              修改密码
            </Button>
          </Form.Item>
        </Form>

        <div style={{ 
          padding: "16px", 
          background: "#fff7e6", 
          border: "1px solid #ffd591",
          borderRadius: "6px" 
        }}>
          <Text type="warning">
            <strong>安全提示：</strong>
            密码修改成功后，您需要重新登录。建议使用包含字母、数字和特殊字符的强密码。
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 密码要求：至少6位，含小写字母(a-z)、大写字母(A-Z)、特殊字符(@$!%*?&)
            </Text>
          </div>
        </div>
      </Space>
    </Card>
  );
};
