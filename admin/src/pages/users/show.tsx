import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Avatar } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";

const { Title, Text } = Typography;

export const UserShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"OpenID"}</Title>
      <TextField value={record?.openid} />
      
      <Title level={5}>{"用户名"}</Title>
      <TextField value={record?.userName} />
      
      <Title level={5}>{"头像"}</Title>
      <Avatar src={record?.avatar} icon={<UserOutlined />} size={64} />
      
      <Title level={5}>{"手机号"}</Title>
      <TextField value={record?.mobile || "-"} />
      
      <Title level={5}>{"等级"}</Title>
      {record?.level ? (
        <Tag color="blue">{record.level}</Tag>
      ) : (
        <Text type="secondary">-</Text>
      )}
      
      <Title level={5}>{"状态"}</Title>
      {record?.status === 1 ? (
        <Tag color="green">正常</Tag>
      ) : (
        <Tag color="red">关闭</Tag>
      )}
      
      <Title level={5}>{"登录次数"}</Title>
      <TextField value={record?.loginCount || 0} />
      
      <Title level={5}>{"最后登录时间"}</Title>
      {record?.lastLoginAt ? (
        <DateField value={record.lastLoginAt} format="YYYY年MM月DD日 HH:mm:ss" />
      ) : (
        <Text type="secondary">-</Text>
      )}
      
      <Title level={5}>{"最后活跃时间"}</Title>
      {record?.lastActiveAt ? (
        <DateField value={record.lastActiveAt} format="YYYY年MM月DD日 HH:mm:ss" />
      ) : (
        <Text type="secondary">-</Text>
      )}
      
      <Title level={5}>{"创建时间"}</Title>
      <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
      
      <Title level={5}>{"更新时间"}</Title>
      <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
    </Show>
  );
};
