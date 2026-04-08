import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag } from "antd";
import React from "react";

export const ProductTypeList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List
      createButtonProps={{
        children: "新建"
      }}
    >
      <Table {...tableProps} rowKey="id">
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        <Table.Column 
          dataIndex="typeName" 
          title={"类型名称"} 
          render={(value: string) => value || "-"}
        />
        <Table.Column
          dataIndex="status"
          title={"状态"}
          width={100}
          render={(value: number) =>
            value === 1 ? (
              <Tag color="green">正常</Tag>
            ) : (
              <Tag color="red">关闭</Tag>
            )
          }
        />
        <Table.Column 
          dataIndex="orderNo" 
          title={"排序"} 
          width={80}
          render={(value: number) => value || 0}
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
