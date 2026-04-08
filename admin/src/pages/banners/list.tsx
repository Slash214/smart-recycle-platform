import {
  DateField,
  DeleteButton,
  EditButton,
  List,
  ShowButton,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Image } from "antd";
import React from "react";
import { getImageUrl } from "../../utils/image";

export const BannerList = () => {
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  return (
    <List
      createButtonProps={{
        children: "新建"
      }}
    >
      <Table 
        {...tableProps} 
        rowKey="id"
      >
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        <Table.Column
          dataIndex="imgUrl"
          title={"图片"}
          width={120}
          render={(value: string) => (
            <Image
              src={getImageUrl(value)}
              alt="轮播图"
              width={100}
              height={60}
              style={{ objectFit: "cover" }}
            />
          )}
        />
        <Table.Column
          dataIndex="text"
          title={"标题文案"}
          render={(value: string) => value || "-"}
        />
        <Table.Column
          dataIndex="link"
          title={"跳转链接"}
          render={(value: string) =>
            value ? (
              <a href={value} target="_blank" rel="noopener noreferrer">
                {value.length > 30 ? value.substring(0, 30) + "..." : value}
              </a>
            ) : (
              "-"
            )
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

