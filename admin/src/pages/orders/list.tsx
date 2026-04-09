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
import { Space, Table, Tag, Select, Button, Input, DatePicker, message, Modal, Form, InputNumber, Typography, Tooltip, Divider } from "antd";
import React from "react";
import type { Dayjs } from "dayjs";
const { RangePicker } = DatePicker;
const { Text } = Typography;

const STATUS_OPTIONS = [
  { label: "已下单", value: 10 },
  { label: "已签收", value: 20 },
  { label: "已报价", value: 30 },
  { label: "已确认", value: 40 },
  { label: "已返款", value: 50 },
  { label: "已完成", value: 60 },
];

export const OrderList = () => {
  const [status, setStatus] = React.useState<number | undefined>(undefined);
  const [keyword, setKeyword] = React.useState<string>("");
  const [range, setRange] = React.useState<[Dayjs, Dayjs] | null>(null);
  const [statusUpdatingKey, setStatusUpdatingKey] = React.useState<string | null>(null);
  const [quoteModalOpen, setQuoteModalOpen] = React.useState(false);
  const [pendingQuoteTarget, setPendingQuoteTarget] = React.useState<{ record: BaseRecord; nextStatus: number } | null>(null);
  const [quoteForm] = Form.useForm<{
    price?: number;
    devices?: Array<{ model: string; memory: string; unit: string; qty: number; price?: number }>;
  }>();

  const { mutate: updateOrder } = useUpdate();

  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: [
        ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ],
    },
  });

  const applyFilters = () => {
    const next = [
      ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
      ...(range ? [{ field: "startAt", operator: "gte" as const, value: range[0].startOf("day").toISOString() }] : []),
      ...(range ? [{ field: "endAt", operator: "lte" as const, value: range[1].endOf("day").toISOString() }] : []),
    ];
    setFilters(next, "replace");
  };

  const patchOrderStatus = (
    record: BaseRecord,
    field: "status",
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
          message.success("订单状态已更新");
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
    const currentDevices = Array.isArray(record.devices)
      ? (record.devices as Array<{ model?: string; memory?: string; unit?: string; qty?: number; price?: string | number | null }>)
      : [];
    const normalizedDevices = currentDevices.map((d) => {
      const unit = d.unit === "board" ? "board" : "whole";
      const priceNum = Number(d.price);
      return {
        model: String(d.model || ""),
        memory: String(d.memory || ""),
        unit,
        qty: Number(d.qty || 0),
        price: Number.isFinite(priceNum) ? priceNum : undefined,
      };
    });

    const autoTotal = normalizedDevices.reduce((sum, d) => {
      const p = Number(d.price);
      const q = Number(d.qty || 0);
      if (!Number.isFinite(p) || q <= 0) return sum;
      return sum + p * q;
    }, 0);

    quoteForm.setFieldsValue({
      devices: normalizedDevices,
      price: Number.isFinite(currentPrice) ? currentPrice : autoTotal || undefined,
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
    const submittedDevices = Array.isArray(values.devices) ? values.devices : [];
    const hasDevices = submittedDevices.length > 0;
    const normalizedDevices = submittedDevices.map((d) => ({
      model: String(d.model || "").trim(),
      memory: String(d.memory || "").trim(),
      unit: d.unit === "board" ? "board" : "whole",
      qty: Number(d.qty || 0),
      price: d.price === undefined || d.price === null ? null : String(d.price),
    }));
    if (hasDevices) {
      const missingIndex = normalizedDevices.findIndex((d) => !d.price || String(d.price).trim() === "");
      if (missingIndex >= 0) {
        message.warning(`请填写第 ${missingIndex + 1} 条回收明细单价`);
        return;
      }
    }

    patchOrderStatus(
      pendingQuoteTarget.record,
      "status",
      pendingQuoteTarget.nextStatus,
      {
        price: String(values.price),
        ...(hasDevices ? { devices: normalizedDevices } : {}),
      },
      closeQuoteModal
    );
  };

  const watchedDevices = Form.useWatch("devices", quoteForm) as Array<{ qty?: number; price?: number }> | undefined;
  const autoSumPrice = React.useMemo(() => {
    if (!Array.isArray(watchedDevices) || watchedDevices.length === 0) return 0;
    return watchedDevices.reduce((sum, d) => {
      const qty = Number(d?.qty || 0);
      const price = Number(d?.price);
      if (!Number.isFinite(price) || qty <= 0) return sum;
      return sum + qty * price;
    }, 0);
  }, [watchedDevices]);

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

  const renderDeviceText = (record: BaseRecord) => {
    const devices = record.devices as Array<{ model?: string; memory?: string; unit?: string; qty?: number; price?: string | null }> | undefined;
    if (!devices || !devices.length) return <Text type="secondary">-</Text>;

    const fullText = devices
      .map((d) => {
        const unitText = d.unit === "board" ? "单板" : "整机";
        const priceText = d.price && String(d.price).trim() ? `，单价:${d.price}` : "";
        return `${d.model || "-"} ${d.memory || "-"} ${unitText}×${d.qty ?? 0}${priceText}`;
      })
      .join("；");

    const preview = devices
      .slice(0, 2)
      .map((d) => `${d.model || "-"} ${d.memory || "-"}×${d.qty ?? 0}`)
      .join("；");
    const suffix = devices.length > 2 ? ` 等${devices.length}项` : "";

    return (
      <Tooltip title={fullText} placement="topLeft">
        <span
          style={{
            display: "inline-block",
            maxWidth: 340,
            overflow: "hidden",
            textOverflow: "ellipsis",
            whiteSpace: "nowrap",
            fontSize: 12,
            cursor: "help",
          }}
        >
          {preview}
          {suffix}
        </span>
      </Tooltip>
    );
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
            placeholder="订单状态"
            allowClear
            value={status}
            onChange={setStatus}
            options={STATUS_OPTIONS}
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
      <Table {...tableProps} rowKey="id" size="middle" tableLayout="fixed" scroll={{ x: 1650 }}>
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
          width={360}
          ellipsis
          render={(_: unknown, record: BaseRecord) => renderDeviceText(record)}
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
          width={210}
          ellipsis
          render={(_: unknown, record: BaseRecord) => {
            const way = Number(record.way || 1);
            let text = "-";
            if (way === 1) text = String(record.wechat_account || "-");
            if (way === 2) text = String(record.alipay_account || "-");
            if (way === 3) {
              text = [record.payee_name, record.bank_name, record.bank_card_no].filter(Boolean).join(" / ") || "-";
            }
            return (
              <Tooltip title={text} placement="topLeft">
                <span
                  style={{
                    display: "inline-block",
                    maxWidth: 190,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                    cursor: "help",
                  }}
                >
                  {text}
                </span>
              </Tooltip>
            );
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
          dataIndex="status"
          title={"订单状态"}
          width={130}
          render={(value: number, record: BaseRecord) => (
            <Select
              size="small"
              style={{ minWidth: 108 }}
              value={value}
              options={STATUS_OPTIONS}
              loading={statusUpdatingKey === `${record.id}-status`}
              disabled={statusUpdatingKey === `${record.id}-status`}
              onChange={(v) => {
                if (v >= 30) {
                  openQuoteModal(record, v);
                  return;
                }
                patchOrderStatus(record, "status", v);
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
        confirmLoading={statusUpdatingKey === `${pendingQuoteTarget?.record?.id}-status`}
        destroyOnClose
      >
        <Form form={quoteForm} layout="vertical">
          <Form.Item label="订单数量">
            <Text>{pendingQuoteTarget?.record?.nums || 0} 件</Text>
          </Form.Item>
          <Divider style={{ margin: "10px 0 14px" }} />
          <Text type="secondary">按每条回收明细填写单价，系统自动汇总；总价可手动调整。</Text>
          <Form.List name="devices">
            {(fields) => (
              <div style={{ marginTop: 10 }}>
                {fields.map(({ key, name }) => {
                  const row = quoteForm.getFieldValue(["devices", name]) || {};
                  const qty = Number(row.qty || 0);
                  const rowPrice = Number(row.price);
                  const subtotal = Number.isFinite(rowPrice) && qty > 0 ? (rowPrice * qty).toFixed(2) : "--";
                  return (
                    <div key={key} style={{ border: "1px solid #f0f0f0", borderRadius: 8, padding: 10, marginBottom: 8 }}>
                      <div style={{ fontSize: 12, marginBottom: 8 }}>
                        {row.model || "-"} / {row.memory || "-"} / {row.unit === "board" ? "单板" : "整机"} ×{qty}
                      </div>
                      <Space align="center" wrap>
                        <Form.Item name={[name, "model"]} hidden><Input /></Form.Item>
                        <Form.Item name={[name, "memory"]} hidden><Input /></Form.Item>
                        <Form.Item name={[name, "unit"]} hidden><Input /></Form.Item>
                        <Form.Item name={[name, "qty"]} hidden><InputNumber /></Form.Item>
                        <Form.Item
                          label="单价"
                          name={[name, "price"]}
                          rules={[{ required: true, message: "必填" }, { type: "number", min: 0, message: ">=0" }]}
                          style={{ marginBottom: 0 }}
                        >
                          <InputNumber min={0} precision={2} placeholder="单价" />
                        </Form.Item>
                        <Text type="secondary">小计：{subtotal}</Text>
                      </Space>
                    </div>
                  );
                })}
              </div>
            )}
          </Form.List>
          <Form.Item
            label="结算总价"
            name="price"
            rules={[
              { required: true, message: "请输入结算总价" },
              { type: "number", min: 0, message: "价格不能小于 0" },
            ]}
            extra={`自动汇总：${autoSumPrice.toFixed(2)}（可手动修改）`}
          >
            <InputNumber
              style={{ width: "100%" }}
              min={0}
              precision={2}
              placeholder="请输入结算总价，例如 199.00"
            />
          </Form.Item>
          <Text type="secondary">
            订单进入“已报价”及后续状态时，将使用你设置的单项价格与总价。
          </Text>
        </Form>
      </Modal>
    </List>
  );
};
