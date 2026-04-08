import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Typography, Select, Image } from "antd";
import React from "react";
import { getImageUrl } from "../../utils/image";

const { Text } = Typography;

export const StoreAddressList = () => {
  const [statusFilter, setStatusFilter] = React.useState<number | null>(1);
  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    filters: {
      permanent:
        statusFilter === null
          ? []
          : [
              {
                field: "status",
                operator: "eq",
                value: statusFilter,
              },
            ],
    },
  });

  const handleStatusChange = (value: number | null) => {
    setStatusFilter(value);
    if (value === null) {
      setFilters([], "replace");
      return;
    }
    setFilters(
      [
        {
          field: "status",
          operator: "eq",
          value,
        },
      ],
      "replace"
    );
  };

  const renderEllipsis = (value: string, width: number) => (
    <Text style={{ maxWidth: width }} ellipsis={{ tooltip: value || "-" }}>
      {value || "-"}
    </Text>
  );

  return (
    <List
      createButtonProps={{
        children: "新建"
      }}
      headerButtons={({ defaultButtons }) => (
        <>
          <Select
            style={{ width: 180 }}
            value={statusFilter}
            onChange={handleStatusChange}
            options={[
              { label: "全部状态", value: null },
              { label: "正常", value: 1 },
              { label: "关闭", value: 0 },
            ]}
            placeholder="状态筛选"
          />
          {defaultButtons}
        </>
      )}
    >
      <Table
        {...tableProps}
        rowKey="id"
        size="middle"
        scroll={{ x: 1700 }}
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ["10", "20", "50", "100"],
        }}
      >
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        
        <Table.Column
          dataIndex="user"
          title={"门店名称/联系人"}
          width={180}
          render={(value: string) => renderEllipsis(value, 160)}
        />

        <Table.Column
          dataIndex="wechat"
          title={"微信号"}
          width={140}
          render={(value: string) => renderEllipsis(value, 120)}
        />

        <Table.Column
          dataIndex="address"
          title={"区域地址"}
          width={220}
          render={(value: string) => renderEllipsis(value, 200)}
        />

        <Table.Column
          dataIndex="fullAddress"
          title={"完整地址"}
          width={260}
          render={(value: string) => renderEllipsis(value, 240)}
        />
        
        <Table.Column
          dataIndex="latitude"
          title={"纬度"}
          width={120}
          render={(value: number) => value ? value.toFixed(6) : "-"}
        />
        
        <Table.Column
          dataIndex="longitude"
          title={"经度"}
          width={120}
          render={(value: number) => value ? value.toFixed(6) : "-"}
        />
        
        <Table.Column
          dataIndex="mobile"
          title={"联系电话"}
          width={140}
          render={(value: string) => renderEllipsis(value, 120)}
        />

        <Table.Column
          dataIndex="busin"
          title={"营业时间"}
          width={120}
          align="center"
          render={(value: string) => value || "-"}
        />

        <Table.Column
          dataIndex="img"
          title={"门店图片"}
          width={120}
          render={(value: string) =>
            value ? (
              <Image
                src={getImageUrl(value)}
                alt="门店图片"
                width={64}
                height={64}
                style={{ objectFit: "cover", borderRadius: 6 }}
              />
            ) : (
              <Text type="secondary">无图片</Text>
            )
          }
        />

        <Table.Column
          dataIndex="defaultAddress"
          title={"默认门店"}
          width={100}
          render={(value: number) =>
            value === 1 ? <Tag color="blue">是</Tag> : <Tag color="default">否</Tag>
          }
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
          dataIndex="createdAt"
          title={"创建时间"}
          width={190}
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
