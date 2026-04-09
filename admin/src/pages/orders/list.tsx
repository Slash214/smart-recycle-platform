import {
  DateField,
  DeleteButton,
  EditButton,
  NumberField,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord, useUpdate } from "@refinedev/core";
import { Space, Table, Tag, Select, Button, Input, DatePicker, message, Modal, Form, InputNumber, Typography } from "antd";
import React from "react";
import type { Dayjs } from "dayjs";
const { RangePicker } = DatePicker;
const { Text } = Typography;

const INBOUND_OPTIONS = [
  { label: "待入库", value: 10 },
  { label: "已入库", value: 20 },
];

const SETTLEMENT_OPTIONS = [
  { label: "待报价", value: 10 },
  { label: "已报价", value: 20 },
  { label: "待结算", value: 30 },
  { label: "已结算", value: 40 },
  { label: "退货中", value: 50 },
];

export const OrderList = () => {
  const [inboundStatus, setInboundStatus] = React.useState<number | undefined>(undefined);
  const [settlementStatus, setSettlementStatus] = React.useState<number | undefined>(undefined);
  const [keyword, setKeyword] = React.useState<string>("");
  const [range, setRange] = React.useState<[Dayjs, Dayjs] | null>(null);
  const [statusUpdatingKey, setStatusUpdatingKey] = React.useState<string | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = React.useState(false);
  const [pendingQuoteTarget, setPendingQuoteTarget] = React.useState<{ record: BaseRecord; nextStatus: number } | null>(null);
  const [quoteForm] = Form.useForm<{ price: number }>();

  const { mutate: updateOrder } = useUpdate();

  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: [
        ...(typeof inboundStatus === "number" ? [{ field: "inbound_status", operator: "eq" as const, value: inboundStatus }] : []),
        ...(typeof settlementStatus === "number" ? [{ field: "settlement_status", operator: "eq" as const, value: settlementStatus }] : []),
      ],
    },
  });

  const applyFilters = () => {
    const next = [
      ...(typeof inboundStatus === "number" ? [{ field: "inbound_status", operator: "eq" as const, value: inboundStatus }] : []),
      ...(typeof settlementStatus === "number" ? [{ field: "settlement_status", operator: "eq" as const, value: settlementStatus }] : []),
      ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
      ...(range ? [{ field: "startAt", operator: "gte" as const, value: range[0].startOf("day").toISOString() }] : []),
      ...(range ? [{ field: "endAt", operator: "lte" as const, value: range[1].endOf("day").toISOString() }] : []),
    ];
    setFilters(next, "replace");
  };

  const patchOrderStatus = (
    record: BaseRecord,
    field: "inbound_status" | "settlement_status",
    value: number,
    extraValues?: Record<string, unknown>,
    onDone?: () => void
  ) => {
    const key = `${record.id}-${field}`;
    setStatusUpdatingKey(key);
    updateOrder(
      {
        resource: "orders",
        id: record.id as string | number,
        values: { [field]: value, ...(extraValues || {}) },
      },
      {
        onSuccess: () => {
          message.success(field === "inbound_status" ? "入库状态已更新" : "结算状态已更新");
          onDone?.();
        },
        onError: (err) => {
          message.error((err as { message?: string })?.message || "更新失败");
        },
        onSettled: () => setStatusUpdatingKey(null),
      }
    );
  };

  const openQuoteModal = (record: BaseRecord, nextStatus: number) => {
    const currentPrice = Number(record.price);
    quoteForm.setFieldsValue({
      price: Number.isFinite(currentPrice) ? currentPrice : undefined,
    });
    setPendingQuoteTarget({ record, nextStatus });
    setQuoteModalOpen(true);
  };

  const closeQuoteModal = () => {
    setQuoteModalOpen(false);
    setPendingQuoteTarget(null);
    quoteForm.resetFields();
  };

  const submitQuoteAndStatus = async () => {
    const values = await quoteForm.validateFields();
    if (!pendingQuoteTarget) return;
    patchOrderStatus(
      pendingQuoteTarget.record,
      "settlement_status",
      pendingQuoteTarget.nextStatus,
      { price: String(values.price) },
      closeQuoteModal
    );
  };

  const getTypeTag = (method: number) => {
    switch (method) {
      case 1:
        return <Tag color="blue">上门</Tag>;
      case 2:
        return <Tag color="green">邮寄</Tag>;
      default:
        return <Tag color="default">未知</Tag>;
    }
  };

  const getWayTag = (way: number) => {
    switch (way) {
      case 1:
        return <Tag color="green">微信收款</Tag>;
      case 2:
        return <Tag color="blue">支付宝收款</Tag>;
      case 3:
        return <Tag color="purple">银行卡收款</Tag>;
      default:
        return <Tag color="default">-</Tag>;
    }
  };

  return (
    <List
      createButtonProps={{
        children: "新建"
      }}
      headerButtons={({ defaultButtons }) => (
        <>
          <Select
            style={{ width: 130 }}
            placeholder="入库状态"
            allowClear
            value={inboundStatus}
            onChange={setInboundStatus}
            options={[
              { label: "待入库", value: 10 },
              { label: "已入库", value: 20 },
            ]}
          />
          <Select
            style={{ width: 130 }}
            placeholder="结算状态"
            allowClear
            value={settlementStatus}
            onChange={setSettlementStatus}
            options={[
              { label: "待报价", value: 10 },
              { label: "已报价", value: 20 },
              { label: "待结算", value: 30 },
              { label: "已结算", value: 40 },
              { label: "退货中", value: 50 },
            ]}
          />
          <Button onClick={applyFilters}>筛选</Button>
          <Input
            style={{ width: 180 }}
            placeholder="关键词"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            allowClear
          />
          <RangePicker
            showTime={false}
            value={range}
            onChange={(v) => setRange((v as [Dayjs, Dayjs]) || null)}
          />
          {defaultButtons}
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        
        <Table.Column
          dataIndex="phone"
          title={"联系电话"}
          width={120}
          render={(value: string) => value || "-"}
        />

        <Table.Column dataIndex="nums" title={"数量"} width={80} render={(value: number) => value || 0} />

        <Table.Column
          title={"回收明细"}
          width={240}
          ellipsis
          render={(_: unknown, record: BaseRecord) => {
            const devices = record.devices as Array<{ model?: string; memory?: string; unit?: string; qty?: number }> | undefined;
            if (!devices || !devices.length) return <Text type="secondary">-</Text>;
            const text = devices
              .map((d) => `${d.model || "-"} ${d.memory || "-"} ${d.unit === "board" ? "单板" : "整机"}×${d.qty ?? 0}`)
              .join("；");
            return (
              <span title={text} style={{ fontSize: 12 }}>
                {text}
              </span>
            );
          }}
        />

        <Table.Column
          dataIndex="price"
          title={"结算价"}
          width={110}
          render={(value: number | string | null) => {
            if (value === null || value === undefined || String(value).trim() === "") return "--";
            const n = Number(value);
            if (!Number.isFinite(n)) return String(value);
            return <NumberField value={n} options={{ minimumFractionDigits: 2, maximumFractionDigits: 2 }} />;
          }}
        />
        
        <Table.Column
          dataIndex="type"
          title={"类型"}
          width={90}
          render={(value: number) => getTypeTag(value)}
        />

        <Table.Column
          dataIndex="way"
          title={"收款方式"}
          width={120}
          render={(value: number) => getWayTag(value)}
        />

        <Table.Column
          title={"收款信息"}
          width={180}
          ellipsis
          render={(_: unknown, record: BaseRecord) => {
            const way = Number(record.way || 1);
            let text = "-";
            if (way === 1) text = String(record.wechat_account || "-");
            if (way === 2) text = String(record.alipay_account || "-");
            if (way === 3) {
              text = [record.payee_name, record.bank_name, record.bank_card_no].filter(Boolean).join(" / ") || "-";
            }
            return <span title={text}>{text}</span>;
          }}
        />
        
        <Table.Column
          dataIndex="tracking_number"
          title={"物流单号"}
          width={150}
          render={(value: string) => value || "-"}
        />

        <Table.Column
          dataIndex="express_company"
          title={"快递公司"}
          width={120}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="inbound_status"
          title={"入库状态"}
          width={130}
          render={(value: number, record: BaseRecord) => (
            <Select
              size="small"
              style={{ minWidth: 108 }}
              value={value}
              options={INBOUND_OPTIONS}
              loading={statusUpdatingKey === `${record.id}-inbound_status`}
              disabled={statusUpdatingKey === `${record.id}-inbound_status`}
              onChange={(v) => patchOrderStatus(record, "inbound_status", v)}
            />
          )}
        />

        <Table.Column
          dataIndex="settlement_status"
          title={"结算状态"}
          width={130}
          render={(value: number, record: BaseRecord) => (
            <Select
              size="small"
              style={{ minWidth: 108 }}
              value={value}
              options={SETTLEMENT_OPTIONS}
              loading={statusUpdatingKey === `${record.id}-settlement_status`}
              disabled={statusUpdatingKey === `${record.id}-settlement_status`}
              onChange={(v) => {
                if (v >= 20) {
                  openQuoteModal(record, v);
                  return;
                }
                patchOrderStatus(record, "settlement_status", v);
              }}
            />
          )}
        />
        
        <Table.Column
          dataIndex="createdAt"
          title={"创建时间"}
          width={180}
          render={(value: string) => (
            <DateField value={value} format="YYYY年MM月DD日 HH:mm:ss" />
          )}
        />
        
        <Table.Column
          title={"操作"}
          dataIndex="actions"
          width={150}
          fixed="right"
          render={(_, record: BaseRecord) => (
            <Space>
              <EditButton hideText size="small" recordItemId={record.id} />
              <ShowButton hideText size="small" recordItemId={record.id} />
              <DeleteButton hideText size="small" recordItemId={record.id} />
            </Space>
          )}
        />
      </Table>

      <Modal
        title="设置结算价格"
        open={quoteModalOpen}
        onOk={submitQuoteAndStatus}
        onCancel={closeQuoteModal}
        okText="确认更新"
        cancelText="取消"
        confirmLoading={statusUpdatingKey === `${pendingQuoteTarget?.record?.id}-settlement_status`}
        destroyOnClose
      >
        <Form form={quoteForm} layout="vertical">
          <Form.Item label="订单数量">
            <Text>{pendingQuoteTarget?.record?.nums || 0} 件</Text>
          </Form.Item>
          <Form.Item
            label="结算总价"
            name="price"
            rules={[
              { required: true, message: "请输入结算总价" },
              { type: "number", min: 0, message: "价格不能小于 0" },
            ]}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="请输入结算总价，例如 199.00"
            />
          </Form.Item>
          <Text type="secondary">
            当前按订单「结算总价」填写；回收明细已单独落库，便于核对件数与机型。
          </Text>
        </Form>
      </Modal>
    </List>
  );
};
