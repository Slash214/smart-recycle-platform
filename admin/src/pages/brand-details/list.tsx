import {
  DateField,
  List,
  useSelect,
  useTable,
} from "@refinedev/antd";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Typography, Button } from "antd";
import React, { useMemo } from "react";
import { useNavigate } from "react-router";

const { Text } = Typography;

export const BrandDetailList = () => {
  const navigate = useNavigate();
  const { tableProps } = useTable({
    syncWithLocation: true,
  });

  const { selectProps: brandSelectProps } = useSelect({
    resource: "brands",
    optionLabel: "brand",
    optionValue: "id",
  });

  // 优化：缓存品牌映射
  const brandIdToLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    brandSelectProps.options?.forEach((option) => {
      map.set(option.value as number, option.label as string);
    });
    return map;
  }, [brandSelectProps.options]);

  return (
    <List
      createButtonProps={{
        children: "新建"
      }}
    >
      <Table 
        {...tableProps} 
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      >
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        
        <Table.Column
          dataIndex="brandId"
          title={"品牌"}
          width={120}
          render={(value: number) => brandIdToLabelMap.get(value) || "-"}
        />
        
        <Table.Column
          dataIndex="content"
          title={"内容预览"}
          render={(value: string) => {
            if (!value) return "-";
            // 移除HTML标签并截取前50个字符
            const textContent = value.replace(/<[^>]*>/g, '').substring(0, 50);
            return textContent ? `${textContent}...` : "-";
          }}
        />
        
        <Table.Column
          dataIndex="imageUrls"
          title={"图片数量"}
          width={100}
          render={(value: string[]) => {
            if (!value || !Array.isArray(value)) return "0";
            return `${value.length} 张`;
          }}
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
          width={100}
          fixed="right"
          render={(_, record: BaseRecord) => (
            <Space>
              <Button
                type="link"
                size="small"
                onClick={() => navigate(`/brand-details/create?brandId=${record.brandId}`)}
              >
                编辑详情
              </Button>
            </Space>
          )}
        />
      </Table>
    </List>
  );
};
