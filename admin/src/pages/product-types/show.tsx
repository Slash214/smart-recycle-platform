import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag } from "antd";
import React from "react";

const { Title } = Typography;

export const ProductTypeShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"类型名称"}</Title>
      <TextField value={record?.typeName} />
      
      <Title level={5}>{"状态"}</Title>
      {record?.status === 1 ? (
        <Tag color="green">正常</Tag>
      ) : (
        <Tag color="red">关闭</Tag>
      )}
      
      <Title level={5}>{"排序"}</Title>
      <TextField value={record?.orderNo} />
      
      <Title level={5}>{"创建时间"}</Title>
      <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
      
      <Title level={5}>{"更新时间"}</Title>
      <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
    </Show>
  );
};
