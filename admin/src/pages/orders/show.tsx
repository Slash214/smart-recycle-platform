import { DateField, Show } from "@refinedev/antd";
import { useShow } from "@refinedev/core";
import { Typography, Tag, Image, Space, Table, Card, Descriptions, Divider } from "antd";
import React from "react";

const { Title, Text } = Typography;

export const OrderShow = () => {
  const { query } = useShow({});
  const { data, isLoading } = query;

  const record = data?.data;

  const getOrderStatusTag = (status: number) => {
    switch (status) {
      case 10:
        return <Tag color="gold">已下单</Tag>;
      case 20:
        return <Tag color="blue">已签收</Tag>;
      case 30:
        return <Tag color="cyan">已报价</Tag>;
      case 40:
        return <Tag color="orange">已确认</Tag>;
      case 50:
        return <Tag color="green">已返款</Tag>;
      case 60:
        return <Tag color="purple">已完成</Tag>;
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

  const getPayoutInfoText = (r: any) => {
    if (!r) return "-";
    if (r.way === 1) return r.wechat_account || "-";
    if (r.way === 2) return r.alipay_account || "-";
    if (r.way === 3) {
      const seg = [r.payee_name, r.bank_name, r.bank_card_no].filter(Boolean);
      return seg.length ? seg.join(" / ") : "-";
    }
    return "-";
  };

  return (
    <Show isLoading={isLoading}>
      <Card bordered={false} bodyStyle={{ paddingTop: 8 }}>
        <Title level={5} style={{ marginTop: 0 }}>
          订单基础信息
        </Title>
        <Descriptions column={2} size="small" bordered>
          <Descriptions.Item label="订单ID">{record?.id ?? "-"}</Descriptions.Item>
          <Descriptions.Item label="联系电话">{record?.phone || "-"}</Descriptions.Item>
          <Descriptions.Item label="数量">{record?.nums || 0}</Descriptions.Item>
          <Descriptions.Item label="类型">
            {record?.type ? getDeliveryMethodTag(record.type) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="收款方式">{getWayText(record?.way)}</Descriptions.Item>
          <Descriptions.Item label="收款信息">{getPayoutInfoText(record)}</Descriptions.Item>
          <Descriptions.Item label="快递公司">{record?.express_company || "-"}</Descriptions.Item>
          <Descriptions.Item label="快递单号">{record?.tracking_number || "-"}</Descriptions.Item>
          <Descriptions.Item label="结算总价">
            {record?.price === null || record?.price === undefined || String(record?.price).trim() === ""
              ? "--"
              : String(record?.price)}
          </Descriptions.Item>
          <Descriptions.Item label="订单状态">
            {record?.status !== undefined ? getOrderStatusTag(record.status) : "-"}
          </Descriptions.Item>
          <Descriptions.Item label="创建时间">
            <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
          </Descriptions.Item>
          <Descriptions.Item label="更新时间">
            <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        <Title level={5}>回收明细</Title>
        {Array.isArray(record?.devices) && record.devices.length > 0 ? (
          <Table
            size="small"
            pagination={false}
            rowKey={(row: { id?: number }, i) => String(row.id ?? i)}
            dataSource={record.devices}
            columns={[
              { title: "机型", dataIndex: "model", render: (v: string) => v || "-" },
              { title: "内存", dataIndex: "memory", render: (v: string) => v || "-" },
              {
                title: "类型",
                dataIndex: "unit",
                width: 100,
                render: (v: string) => (v === "board" ? "单板" : "整机"),
              },
              { title: "数量", dataIndex: "qty", width: 90 },
              { title: "单项价格", dataIndex: "price", width: 120, render: (v: string | null) => (v && String(v).trim() ? String(v) : "--") },
            ]}
          />
        ) : (
          <Text type="secondary">暂无明细（历史订单可能仅在备注中）</Text>
        )}

        <Divider />

        <Title level={5}>备注信息</Title>
        <Card size="small" style={{ marginBottom: 16 }}>
          <Text style={{ whiteSpace: "pre-wrap" }}>{record?.remark || "-"}</Text>
        </Card>

        <Title level={5}>备注图片</Title>
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
      </Card>
    </Show>
  );
};
