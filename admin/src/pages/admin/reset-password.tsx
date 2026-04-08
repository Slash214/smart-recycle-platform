import { Form, Input, Button, Card, Typography, Space, message, Modal } from "antd";
import { LockOutlined, CheckCircleOutlined } from "@ant-design/icons";
import React, { useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useLogout } from "@refinedev/core";
import { API_URL } from "../../constants/app";
import { getAuthHeaders } from "../../utils/auth";

const { Title, Text } = Typography;

export const ResetPassword = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { mutate: logout } = useLogout();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (values: { newPassword: string; confirmPassword: string }) => {
    if (!id) {
      message.error("管理员ID不能为空");
      return;
    }

    if (values.newPassword !== values.confirmPassword) {
      message.error("两次输入的密码不一致");
      return;
    }

    if (values.newPassword.length < 6) {
      message.error("密码长度至少6位");
      return;
    }

    // 检查是否包含大写字母
    if (!/[A-Z]/.test(values.newPassword)) {
      message.error("密码必须包含至少一个大写字母");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/admins/${id}/reset-password`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({
          newPassword: values.newPassword,
        }),
      });

      const data = await response.json();

      if (response.ok && data.code === 200) {
        message.success("密码重置成功！");
        
        // 显示成功弹窗，然后退出登录
        Modal.success({
          title: "密码重置成功",
          content: `管理员密码已成功重置，系统将退出登录，请使用新密码重新登录。`,
          icon: <CheckCircleOutlined style={{ color: "#52c41a" }} />,
          onOk: () => {
            // 清除本地存储
            localStorage.removeItem("auth_token");
            localStorage.removeItem("auth_user");
            // 退出登录并跳转到登录页
            logout();
          },
          okText: "重新登录",
          cancelButtonProps: { style: { display: "none" } },
        });
      } else {
        message.error(data.message || data.error?.message || "密码重置失败");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("重置密码失败:", error);
      }
      message.error("网络错误，请稍后重试");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <Space direction="vertical" size="large" style={{ width: "100%" }}>
        <div>
          <Title level={3}>重置管理员密码</Title>
          <Text type="secondary">管理员ID: {id}</Text>
        </div>

        <Form
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
          style={{ maxWidth: 500 }}
        >
          <Form.Item
            name="newPassword"
            label="新密码"
            rules={[
              { required: true, message: "请输入新密码" },
              { min: 6, message: "密码长度至少6位" },
              {
                pattern: /[A-Z]/,
                message: "密码必须包含至少一个大写字母",
              },
            ]}
          >
            <Input.Password
              prefix={<LockOutlined />}
              placeholder="请输入新密码（至少6位，包含大写字母）"
              size="large"
            />
          </Form.Item>

          <Form.Item
            name="confirmPassword"
            label="确认密码"
            dependencies={["newPassword"]}
            rules={[
              { required: true, message: "请再次输入密码" },
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
              prefix={<LockOutlined />}
              placeholder="请再次输入新密码"
              size="large"
            />
          </Form.Item>

          <Form.Item>
            <Space>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                icon={<LockOutlined />}
                size="large"
              >
                重置密码
              </Button>
              <Button
                onClick={() => {
                  form.resetFields();
                  navigate(-1);
                }}
                size="large"
              >
                取消
              </Button>
            </Space>
          </Form.Item>
        </Form>

        <div style={{ 
          padding: "16px", 
          background: "#fff7e6", 
          borderRadius: "4px",
          border: "1px solid #ffe58f"
        }}>
          <Text type="warning">
            ⚠️ 注意：重置密码后，该管理员需要使用新密码登录系统。
          </Text>
          <div style={{ marginTop: 8 }}>
            <Text type="secondary" style={{ fontSize: 12 }}>
              💡 密码要求：至少6位字符，必须包含至少一个大写字母（A-Z）
            </Text>
          </div>
        </div>
      </Space>
    </Card>
  );
};

