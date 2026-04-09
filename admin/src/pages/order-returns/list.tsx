import { List, DateField, useTable } from "@refinedev/antd";
import { type BaseRecord, useUpdate } from "@refinedev/core";
import { Table, Tag, Space, Button, Modal, Input, Select, App } from "antd";
import React from "react";

const STATUS_OPTIONS = [
  { label: "待审核", value: 10 },
  { label: "已同意", value: 20 },
  { label: "已拒绝", value: 30 },
];

export const OrderReturnList = () => {
  const { message } = App.useApp();
  const [statusFilter, setStatusFilter] = React.useState<number | undefined>(10);
  const [auditOpen, setAuditOpen] = React.useState(false);
  const [auditTarget, setAuditTarget] = React.useState<BaseRecord | null>(null);
  const [auditAction, setAuditAction] = React.useState<"approve" | "reject">("approve");
  const [auditRejectReason, setAuditRejectReason] = React.useState("");
  const { mutate: updateOne, mutation } = useUpdate();
  const auditSubmitting = Boolean((mutation as { isPending?: boolean; isLoading?: boolean } | undefined)?.isPending ?? (mutation as { isPending?: boolean; isLoading?: boolean } | undefined)?.isLoading);

  const { tableProps, setFilters } = useTable({
    resource: "order-returns",
    syncWithLocation: true,
    filters: {
      permanent: typeof statusFilter === "number" ? [{ field: "status", operator: "eq", value: statusFilter }] : [],
    },
  });

  const applyFilters = () => {
    const next = typeof statusFilter === "number" ? [{ field: "status", operator: "eq" as const, value: statusFilter }] : [];
    setFilters(next, "replace");
  };

  const openAudit = (record: BaseRecord) => {
    setAuditTarget(record);
    setAuditAction("approve");
    setAuditRejectReason("");
    setAuditOpen(true);
  };

  const submitAudit = async () => {
    if (!auditTarget) return;
    if (auditAction === "reject" && !auditRejectReason.trim()) {
      message.warning("请输入拒绝原因");
      return;
    }
    updateOne(
      {
        resource: "order-returns",
        id: auditTarget.id as string | number,
        values: {
          action: auditAction,
          reject_reason: auditAction === "reject" ? auditRejectReason.trim() : "",
        },
      },
      {
        onSuccess: () => {
          message.success("审核完成");
          setAuditOpen(false);
          setAuditTarget(null);
          setAuditAction("approve");
          setAuditRejectReason("");
        },
        onError: (err) => {
          message.error((err as { message?: string })?.message || "审核失败");
        },
      },
    );
  };

  return (
    <List
      canCreate={false}
      headerButtons={({ defaultButtons }) => (
        <>
          <Select
            style={{ width: 140 }}
            options={STATUS_OPTIONS}
            allowClear
            placeholder="审核状态"
            value={statusFilter}
            onChange={setStatusFilter}
          />
          <Button onClick={applyFilters}>筛选</Button>
          {defaultButtons}
        </>
      )}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title="ID" width={80} />
        <Table.Column
          title="订单ID"
          dataIndex={["order_id"]}
          width={100}
          render={(v: number, record: BaseRecord) => v || record?.order?.id || "-"}
        />
        <Table.Column dataIndex="userid" title="用户ID" width={110} />
        <Table.Column
          dataIndex="reason"
          title="退货原因"
          ellipsis
          render={(v: string) => <span title={v}>{v || "-"}</span>}
        />
        <Table.Column
          dataIndex="status"
          title="状态"
          width={100}
          render={(v: number) => {
            if (v === 10) return <Tag color="gold">待审核</Tag>;
            if (v === 20) return <Tag color="green">已同意</Tag>;
            if (v === 30) return <Tag color="red">已拒绝</Tag>;
            return <Tag>未知</Tag>;
          }}
        />
        <Table.Column dataIndex="reject_reason" title="拒绝原因" width={200} ellipsis />
        <Table.Column
          dataIndex="createdAt"
          title="申请时间"
          width={180}
          render={(v: string) => <DateField value={v} format="YYYY-MM-DD HH:mm:ss" />}
        />
        <Table.Column
          title="操作"
          width={120}
          render={(_: unknown, record: BaseRecord) => (
            <Space>
              {Number(record.status) === 10 ? (
                <Button type="primary" size="small" onClick={() => openAudit(record)}>
                  审核
                </Button>
              ) : (
                <Button size="small" disabled>
                  已处理
                </Button>
              )}
            </Space>
          )}
        />
      </Table>

      <Modal
        title="退货审核"
        open={auditOpen}
        onOk={submitAudit}
        onCancel={() => {
          setAuditOpen(false);
          setAuditAction("approve");
          setAuditRejectReason("");
        }}
        confirmLoading={auditSubmitting}
        okText="确认"
        cancelText="取消"
        destroyOnHidden
      >
        <div>
          <div style={{ marginBottom: 12 }}>
            <div style={{ marginBottom: 8 }}>审核动作</div>
            <Select
              style={{ width: "100%" }}
              value={auditAction}
              onChange={(v) => setAuditAction(v)}
              options={[
                { value: "approve", label: "同意退货" },
                { value: "reject", label: "拒绝退货" },
              ]}
            />
          </div>
          {auditAction === "reject" ? (
            <div>
              <div style={{ marginBottom: 8 }}>拒绝原因</div>
              <Input.TextArea
                rows={3}
                value={auditRejectReason}
                onChange={(e) => setAuditRejectReason(e.target.value)}
                placeholder="请输入拒绝原因"
              />
            </div>
          ) : null}
        </div>
      </Modal>
    </List>
  );
};
