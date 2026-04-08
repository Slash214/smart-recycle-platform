import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Typography, Select, Input, Button } from "antd";
import React from "react";

const { Text } = Typography;

export const OrderList = () => {
  const [status, setStatus] = React.useState<number | undefined>(undefined);
  const [type, setType] = React.useState<number | undefined>(undefined);
  const [keyword, setKeyword] = React.useState<string>("");

  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: [
        ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
        ...(typeof type === "number" ? [{ field: "type", operator: "eq" as const, value: type }] : []),
        ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
      ],
    },
  });

  const applyFilters = () => {
    const next = [
      ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ...(typeof type === "number" ? [{ field: "type", operator: "eq" as const, value: type }] : []),
      ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
    ];
    setFilters(next, "replace");
  };

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
    <List
      createButtonProps={{
        children: "新建"
      }}
      headerButtons={({ defaultButtons }) => (
        <>
          <Select
            style={{ width: 130 }}
            placeholder="状态"
            allowClear
            value={status}
            onChange={setStatus}
            options={[
              { label: "待处理", value: 1 },
              { label: "运输中", value: 2 },
              { label: "完成", value: 3 },
            ]}
          />
          <Select
            style={{ width: 130 }}
            placeholder="类型"
            allowClear
            value={type}
            onChange={setType}
            options={[
              { label: "上门", value: 1 },
              { label: "邮寄", value: 2 },
            ]}
          />
          <Input.Search
            style={{ width: 220 }}
            placeholder="关键词搜索"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onSearch={applyFilters}
            allowClear
          />
          <Button onClick={applyFilters}>筛选</Button>
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
          render={(value: number) => getDeliveryMethodTag(value)}
        />

        <Table.Column
          dataIndex="way"
          title={"收货方式"}
          width={120}
          render={(value: string) => value || "-"}
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
          title={"状态"}
          width={100}
          render={(value: number) => getStatusTag(value)}
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
