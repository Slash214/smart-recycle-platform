import React from "react";
import { Button, InputNumber, Space, Card, Typography, Input } from "antd";
import { PlusOutlined, DeleteOutlined } from "@ant-design/icons";

const { Text } = Typography;

export interface Variant {
  price: number;
  title: string;
}

interface ProductVariantsProps {
  value?: { variants: Variant[] } | string;
  onChange?: (value: { variants: Variant[] }) => void;
}

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  value,
  onChange,
}) => {
  // 处理 value 可能是字符串（JSON）或对象的情况
  let variants: Variant[] = [];
  if (value) {
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        variants = parsed?.variants || [];
      } catch {
        variants = [];
      }
    } else if (value.variants && Array.isArray(value.variants)) {
      variants = value.variants;
    }
  }

  const handleAdd = () => {
    const newVariants = [
      ...variants,
      {
        price: 0,
        title: "",
      },
    ];
    onChange?.({ variants: newVariants });
  };

  const handleRemove = (index: number) => {
    const newVariants = variants.filter((_, i) => i !== index);
    onChange?.({ variants: newVariants });
  };

  const handleChange = (index: number, field: keyof Variant, fieldValue: string | number) => {
    const newVariants = [...variants];
    newVariants[index] = {
      ...newVariants[index],
      [field]: fieldValue,
    };
    onChange?.({ variants: newVariants });
  };

  return (
    <div>
      <Space direction="vertical" style={{ width: "100%" }} size="middle">
        {variants.map((variant, index) => (
          <Card
            key={index}
            size="small"
            style={{ backgroundColor: "#fafafa" }}
            extra={
              <Button
                type="text"
                danger
                icon={<DeleteOutlined />}
                onClick={() => handleRemove(index)}
                size="small"
              >
                删除
              </Button>
            }
          >
            <Space direction="vertical" style={{ width: "100%" }} size="small">
              <div>
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  价格（元）
                </Text>
                <InputNumber
                  style={{ width: "100%" }}
                  placeholder="请输入价格"
                  min={0}
                  max={999999.99}
                  precision={2}
                  value={variant.price}
                  onChange={(val) => handleChange(index, "price", val || 0)}
                />
              </div>
              <div>
                <Text strong style={{ display: "block", marginBottom: 4 }}>
                  标题
                </Text>
                <Input
                  placeholder="请输入标题，如：开机屏好"
                  value={variant.title}
                  onChange={(e) => handleChange(index, "title", e.target.value)}
                  maxLength={100}
                />
              </div>
            </Space>
          </Card>
        ))}

        <Button
          type="dashed"
          onClick={handleAdd}
          block
          icon={<PlusOutlined />}
        >
          添加规格
        </Button>
      </Space>

      {variants.length === 0 && (
        <div style={{ textAlign: "center", padding: "20px", color: "#999" }}>
          <Text type="secondary">暂无规格，请点击"添加规格"按钮添加</Text>
        </div>
      )}
    </div>
  );
};

