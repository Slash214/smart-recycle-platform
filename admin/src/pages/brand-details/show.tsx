import { DateField, Show, TextField } from "@refinedev/antd";
import { Typography, Tag, Image, Space, Card, Divider, Button } from "antd";
import React from "react";
import { getImageUrl } from "../../utils/image";
import { useNavigate, useParams } from "react-router";
import { API_URL } from "../../constants/app";
import { getAuthHeaders } from "../../utils/auth";

const { Title, Text } = Typography;

export const BrandDetailShow = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [record, setRecord] = React.useState<any>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    if (!id) return;
    const load = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API_URL}/brands/${id}/details`, {
          headers: getAuthHeaders(false),
        });
        const payload = await res.json().catch(() => ({}));
        setRecord(payload?.data || null);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [id]);

  return (
    <Show
      isLoading={isLoading}
      headerButtons={() => (
        <Space>
          <Button onClick={() => navigate(`/brand-details/create?brandId=${record?.brandId || id || ""}`)}>
            编辑
          </Button>
        </Space>
      )}
    >
      <Card>
        <Title level={5}>{"ID"}</Title>
        <TextField value={record?.id} />
        
        <Divider />
        
        <Title level={5}>{"品牌"}</Title>
        <TextField value={record?.brandId || "-"} />
        
        <Divider />
        
        <Title level={5}>{"内容"}</Title>
        <div 
          style={{ 
            padding: '16px',
            border: '1px solid #f0f0f0',
            borderRadius: '4px',
            backgroundColor: '#fafafa',
            minHeight: '100px',
          }}
          dangerouslySetInnerHTML={{ __html: record?.content || "" }}
        />
        
        <Divider />
        
        <Title level={5}>{"图片列表"}</Title>
        {record?.imageUrls && record.imageUrls.length > 0 ? (
          <Image.PreviewGroup>
            <Space wrap size="middle">
              {record.imageUrls.map((url: string, index: number) => (
                <Image
                  key={index}
                  width={200}
                  src={getImageUrl(url)}
                  alt={`图片${index + 1}`}
                  style={{ borderRadius: '4px' }}
                />
              ))}
            </Space>
          </Image.PreviewGroup>
        ) : (
          <Text type="secondary">暂无图片</Text>
        )}
        
        <Divider />
        
        <Title level={5}>{"状态"}</Title>
        {record?.status === 1 ? (
          <Tag color="green">正常</Tag>
        ) : (
          <Tag color="red">关闭</Tag>
        )}
        
        <Divider />
        
        <Title level={5}>{"创建时间"}</Title>
        <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
        
        <Divider />
        
        <Title level={5}>{"更新时间"}</Title>
        <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
      </Card>
    </Show>
  );
};
