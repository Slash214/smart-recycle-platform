import React, { useEffect, useState } from "react";
import { Card, Typography, Space, Tag } from "antd";

const { Title, Text } = Typography;

export const BannerTest = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetch("http://localhost:3000/v1/banners");
        const result = await response.json();
        
        console.log("API Response:", result);
        setData(result);
        setError(null);
      } catch (err) {
        console.error("API Error:", err);
        setError(err instanceof Error ? err.message : "未知错误");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error}</div>;

  return (
    <Card title="API 测试">
      <Space direction="vertical" style={{ width: "100%" }}>
        <div>
          <Title level={4}>原始响应数据:</Title>
          <pre style={{ background: "#f5f5f5", padding: "10px", borderRadius: "4px" }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
        
        <div>
          <Title level={4}>数据类型检查:</Title>
          <Space>
            <Tag>data 类型: {typeof data}</Tag>
            <Tag>data.data 类型: {typeof data?.data}</Tag>
            <Tag>data.data 是数组: {Array.isArray(data?.data) ? "是" : "否"}</Tag>
            <Tag>data.items 类型: {typeof data?.items}</Tag>
            <Tag>data.items 是数组: {Array.isArray(data?.items) ? "是" : "否"}</Tag>
          </Space>
        </div>

        {data?.data && Array.isArray(data.data) && (
          <div>
            <Title level={4}>数据列表:</Title>
            {data.data.map((item: any) => (
              <Card key={item.id} size="small" style={{ marginBottom: "8px" }}>
                <Text strong>ID: {item.id}</Text> - {item.text || "无标题"}
              </Card>
            ))}
          </div>
        )}

        {data?.items && Array.isArray(data.items) && (
          <div>
            <Title level={4}>Items 列表:</Title>
            {data.items.map((item: any) => (
              <Card key={item.id} size="small" style={{ marginBottom: "8px" }}>
                <Text strong>ID: {item.id}</Text> - {item.text || "无标题"}
              </Card>
            ))}
          </div>
        )}
      </Space>
    </Card>
  );
};
