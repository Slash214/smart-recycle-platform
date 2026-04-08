import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Image, Space } from "antd";
import React from "react";

const { Title, Text } = Typography;

export const OrderShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  const getStatusTag = (status: number) => {
    switch (status) {
      case 1:
        return <Tag color="blue">待处理</Tag>;
      case 2:
        return <Tag color="orange">运输中</Tag>;
      case 3:
        return <Tag color="green">完成</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  const getDeliveryMethodTag = (method: number) => {
    switch (method) {
      case 1:
        return <Tag color="blue">上门</Tag>;
      case 2:
        return <Tag color="green">邮寄</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  return (
    <Show isLoading={isLoading}>
      <Title level={5}>{"ID"}</Title>
      <TextField value={record?.id} />
      
      <Title level={5}>{"联系电话"}</Title>
      <TextField value={record?.phone} />

      <Title level={5}>{"数量"}</Title>
      <TextField value={record?.nums || 0} />
      
      <Title level={5}>{"类型"}</Title>
      {record?.type && getDeliveryMethodTag(record.type)}

      <Title level={5}>{"收货方式"}</Title>
      <TextField value={record?.way || "-"} />
      
      <Title level={5}>{"快递单号"}</Title>
      <TextField value={record?.tracking_number || "-"} />

      <Title level={5}>{"快递公司"}</Title>
      <TextField value={record?.express_company || "-"} />
      
      <Title level={5}>{"状态"}</Title>
      {record?.status !== undefined && getStatusTag(record.status)}
      
      <Title level={5}>{"备注"}</Title>
      <TextField value={record?.remark || "-"} />

      <Title level={5}>{"备注图片"}</Title>
      {Array.isArray(record?.remark_images) && record.remark_images.length > 0 ? (
        <Image.PreviewGroup>
          <Space wrap>
            {record.remark_images.map((url: string, idx: number) => (
              <Image key={idx} src={url} width={120} height={120} style={{ objectFit: "cover" }} />
            ))}
          </Space>
        </Image.PreviewGroup>
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
