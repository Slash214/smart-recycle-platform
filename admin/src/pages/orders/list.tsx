import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Select, Button, Input, DatePicker } from "antd";
import React from "react";
import type { Dayjs } from "dayjs";
const { RangePicker } = DatePicker;

export const OrderList = () => {
  const [inboundStatus, setInboundStatus] = React.useState<number | undefined>(undefined);
  const [settlementStatus, setSettlementStatus] = React.useState<number | undefined>(undefined);
  const [keyword, setKeyword] = React.useState<string>("");
  const [range, setRange] = React.useState<[Dayjs, Dayjs] | null>(null);

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
          width={100}
          render={(value: number) => getInboundStatusTag(value)}
        />

        <Table.Column
          dataIndex="settlement_status"
          title={"结算状态"}
          width={110}
          render={(value: number) => getSettlementStatusTag(value)}
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
    </List>
  );
};
