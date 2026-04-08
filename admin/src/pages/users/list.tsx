import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Avatar, Typography, Select, Input, Button, message } from "antd";
import { UserOutlined } from "@ant-design/icons";
import React from "react";
import { API_URL } from "../../constants/app";
import { getAuthHeaders } from "../../utils/auth";

const { Text } = Typography;

export const UserList = () => {
  const [platform, setPlatform] = React.useState<string | undefined>("WECHAT");
  const [status, setStatus] = React.useState<number | undefined>(1);
  const [keyword, setKeyword] = React.useState<string>("");

  const { tableProps, setFilters, tableQuery } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: [
        ...(platform ? [{ field: "platform", operator: "eq" as const, value: platform }] : []),
        ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
        ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
      ],
    },
  });

  const applyFilters = () => {
    const next = [
      ...(platform ? [{ field: "platform", operator: "eq" as const, value: platform }] : []),
      ...(typeof status === "number" ? [{ field: "status", operator: "eq" as const, value: status }] : []),
      ...(keyword ? [{ field: "keyword", operator: "contains" as const, value: keyword }] : []),
    ];
    setFilters(next, "replace");
  };

  const handleToggleStatus = async (record: BaseRecord) => {
    const nextStatus = record.status === 1 ? 0 : 1;
    try {
      const res = await fetch(`${API_URL}/admin/users/${record.id}/status`, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(payload?.message || "更新状态失败");
      message.success("用户状态更新成功");
      tableQuery?.refetch?.();
    } catch (error) {
      message.error(error instanceof Error ? error.message : "更新状态失败");
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
            style={{ width: 140 }}
            value={platform}
            onChange={(v) => setPlatform(v)}
            options={[
              { label: "微信", value: "WECHAT" },
              { label: "全部平台", value: undefined },
            ]}
            placeholder="平台"
            allowClear
          />
          <Select
            style={{ width: 120 }}
            value={status}
            onChange={(v) => setStatus(v)}
            options={[
              { label: "正常", value: 1 },
              { label: "关闭", value: 0 },
              { label: "全部状态", value: undefined },
            ]}
            placeholder="状态"
            allowClear
          />
          <Input.Search
            style={{ width: 220 }}
            placeholder="搜索昵称/手机号"
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
          dataIndex="userName"
          title={"用户名"}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="avatar"
          title={"头像"}
          width={80}
          render={(value: string) => (
            <Avatar src={value} icon={<UserOutlined />} size={40} />
          )}
        />
        
        <Table.Column
          dataIndex="mobile"
          title={"手机号"}
          width={120}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="level"
          title={"等级"}
          width={100}
          render={(value: string) => 
            value ? <Tag color="blue">{value}</Tag> : "-"
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
          dataIndex="loginCount"
          title={"登录次数"}
          width={100}
          render={(value: number) => value || 0}
        />
        
        <Table.Column
          dataIndex="lastLoginAt"
          title={"最后登录"}
          width={180}
          render={(value: string) => (
            value ? <DateField value={value} format="YYYY年MM月DD日 HH:mm:ss" /> : "-"
          )}
        />
        
        <Table.Column
          title={"操作"}
          dataIndex="actions"
          width={220}
          fixed="right"
          render={(_, record: BaseRecord) => (
            <Space>
              <Button size="small" onClick={() => handleToggleStatus(record)}>
                {record.status === 1 ? "禁用" : "启用"}
              </Button>
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
