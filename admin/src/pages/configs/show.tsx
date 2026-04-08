import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag } from "antd";
import React from "react";

const { Title } = Typography;

export const ConfigShow = () => {
  const { query } = useShow({
    resource: "configs",
  });
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"配置名称"}</Title>
      <TextField value={record?.name} />
      
      <Title level={5}>{"客服电话"}</Title>
      <TextField value={record?.servicePhone || "-"} />
      
      <Title level={5}>{"联系微信"}</Title>
      <TextField value={record?.contactWechat || "-"} />
      
      <Title level={5}>{"默认收货地址"}</Title>
      <TextField value={record?.defaultAddress || "-"} />
      
      <Title level={5}>{"默认收货地址联系人"}</Title>
      <TextField value={record?.defaultContactName || "-"} />
      
      <Title level={5}>{"默认收货地址联系方式"}</Title>
      <TextField value={record?.defaultContactPhone || "-"} />
      
      <Title level={5}>{"状态"}</Title>
      {record?.status === 1 ? (
        <Tag color="green">启用</Tag>
      ) : (
        <Tag color="red">停用</Tag>
      )}
      
      <Title level={5}>{"备注说明"}</Title>
      <TextField value={record?.remark || "-"} />
      
      <Title level={5}>{"创建时间"}</Title>
      <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
      
      <Title level={5}>{"更新时间"}</Title>
      <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
    </Show>
  );
};

