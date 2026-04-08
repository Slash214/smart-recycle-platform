import { DateField, Show, TextField } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Image, Space } from "antd";
import React from "react";

const { Title, Text } = Typography;

export const OrderShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  const getInboundStatusTag = (status: number) => {
    switch (status) {
      case 10:
        return <Tag color="gold">待入库</Tag>;
      case 20:
        return <Tag color="blue">已入库</Tag>;
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

  const getSettlementStatusTag = (status: number) => {
    switch (status) {
      case 10:
        return <Tag color="gold">待报价</Tag>;
      case 20:
        return <Tag color="cyan">已报价</Tag>;
      case 30:
        return <Tag color="orange">待结算</Tag>;
      case 40:
        return <Tag color="green">已结算</Tag>;
      case 50:
        return <Tag color="red">退货中</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  const getWayText = (way: number) => {
    switch (way) {
      case 1:
        return "微信收款";
      case 2:
        return "支付宝收款";
      case 3:
        return "银行卡收款";
      default:
        return "-";
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

      <Title level={5}>{"收款方式"}</Title>
      <TextField value={getWayText(record?.way)} />
      
      <Title level={5}>{"快递单号"}</Title>
      <TextField value={record?.tracking_number || "-"} />

      <Title level={5}>{"快递公司"}</Title>
      <TextField value={record?.express_company || "-"} />
      
      <Title level={5}>{"入库状态"}</Title>
      {record?.inbound_status !== undefined && getInboundStatusTag(record.inbound_status)}
      
      <Title level={5}>{"结算状态"}</Title>
      {record?.settlement_status !== undefined && getSettlementStatusTag(record.settlement_status)}
      
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
