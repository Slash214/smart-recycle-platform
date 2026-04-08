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

export const ConfigList = () => {
  const { tableProps } = useTable({
    resource: "configs",
    syncWithLocation: true,
  });

  return (
    <List
      createButtonProps={{
        children: "新建配置"
      }}
    >
      <Table {...tableProps} rowKey="id" pagination={{
        ...tableProps.pagination,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total) => `共 ${total} 条`,
        pageSizeOptions: ['10', '20', '50', '100'],
      }}>
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        
        <Table.Column 
          dataIndex="name" 
          title={"配置名称"} 
          width={120}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="servicePhone"
          title={"客服电话"}
          width={150}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="contactWechat"
          title={"联系微信"}
          width={150}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="defaultAddress"
          title={"默认收货地址"}
          render={(value: string) => {
            if (!value) return "-";
            return value.length > 50 ? `${value.substring(0, 50)}...` : value;
          }}
        />
        
        <Table.Column
          dataIndex="defaultContactName"
          title={"联系人"}
          width={120}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="defaultContactPhone"
          title={"联系电话"}
          width={130}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="status"
          title={"状态"}
          width={100}
          render={(value: number) =>
            value === 1 ? (
              <Tag color="green">启用</Tag>
            ) : (
              <Tag color="red">停用</Tag>
            )
          }
        />
        
        <Table.Column
          dataIndex="remark"
          title={"备注"}
          render={(value: string) => {
            if (!value) return "-";
            return value.length > 30 ? `${value.substring(0, 30)}...` : value;
          }}
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
              <DeleteButton 
                hideText 
                size="small" 
                recordItemId={record.id}
                disabled={record.status === 1}
                title={record.status === 1 ? "不能删除启用的配置，请先停用" : "删除"}
              />
            </Space>
          )}
        />
      </Table>
    </List>
  );
};

