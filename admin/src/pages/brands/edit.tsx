import { Edit, useForm } from "@refinedev/antd";
import { useSelect } from "@refinedev/antd";
import { Form, Input, InputNumber, Select, Switch, Button } from "antd";
import React, { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router";
import { ImageUpload } from "../../components";
import { UnorderedListOutlined } from "@ant-design/icons";

export const BrandEdit = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnParams = searchParams.get('returnParams');
  
  const { formProps, saveButtonProps, query } = useForm({
    redirect: false, // 禁用默认跳转，使用自定义跳转逻辑
  });
  
  // 返回列表页时，恢复之前的筛选状态和页码
  const handleBackToList = () => {
    if (returnParams) {
      navigate(`/brands?returnParams=${encodeURIComponent(returnParams)}`);
    } else {
      navigate('/brands');
    }
  };

  const { selectProps: productTypeSelectProps } = useSelect({
    resource: "product-types",
    optionLabel: "typeName",
    optionValue: "id",
  });

  // 在数据加载后，正确设置表单值（将 1/0 转换为 boolean）
  useEffect(() => {
    if (query?.data?.data && formProps.form) {
      const data = query.data.data;
      const form = formProps.form;
      
      // 设置表单字段，将 status 和 hasUpdate 从 1/0 转换为 boolean
      setTimeout(() => {
        form.setFieldsValue({
          ...data,
          ptypeId: data.ptypeId ?? data.type ?? data.typeId,
          status: data.status === 1,
          updateinfo: (data.updateinfo ?? data.hasUpdate) === 1,
        });
      }, 100);
    }
  }, [query?.data?.data, formProps.form]);

  return (
    <Edit 
      saveButtonProps={saveButtonProps}
      headerButtons={() => (
        <>
          <Button 
            icon={<UnorderedListOutlined />}
            onClick={handleBackToList}
          >
            品牌列表
          </Button>
          <Button onClick={handleBackToList}>
            返回列表
          </Button>
        </>
      )}
    >
      <Form 
        {...formProps} 
        layout="vertical"
        onFinish={async (values: Record<string, unknown>) => {
          // 将Switch的boolean值转换为1/0
          const submitData = {
            ...values,
            ptypeId: values.ptypeId,
            updateinfo: values.updateinfo ? 1 : 0,
            status: values.status ? 1 : 0,
          };
          const result = await formProps.onFinish?.(submitData);
          // 保存成功后，返回列表页并保持状态
          if (returnParams) {
            navigate(`/brands?returnParams=${encodeURIComponent(returnParams)}`);
          } else {
            navigate('/brands');
          }
          return result;
        }}
      >
        <Form.Item
          label={"ID"}
          name={["id"]}
          rules={[{ required: true }]}
          hidden
        >
          <Input readOnly />
        </Form.Item>

        <Form.Item
          label={"品牌名称"}
          name={["brand"]}
          rules={[
            {
              required: true,
              message: "请输入品牌名称",
            },
            {
              max: 100,
              message: "品牌名称最大长度为100",
            },
          ]}
        >
          <Input placeholder="请输入品牌名称" />
        </Form.Item>

        <Form.Item
          label={"产品类型"}
          name={["ptypeId"]}
          rules={[
            {
              required: true,
              message: "请选择产品类型",
            },
          ]}
        >
          <Select {...productTypeSelectProps} placeholder="请选择产品类型" />
        </Form.Item>

        <Form.Item
          label={"品牌Logo"}
          name={["logo"]}
          rules={[
            {
              required: true,
              message: "请上传品牌Logo",
            },
          ]}
        >
          <ImageUpload />
        </Form.Item>

        <Form.Item
          label={"排序"}
          name={["orderNum"]}
          rules={[
            {
              required: true,
              message: "请输入排序号",
            },
          ]}
        >
          <InputNumber
            placeholder="请输入排序号"
            min={1}
            max={9999}
            style={{ width: "100%" }}
          />
        </Form.Item>

        <Form.Item
          label={"有更新"}
          name={["updateinfo"]}
          valuePropName="checked"
          rules={[{ required: true, message: "请选择是否有更新" }]}
        >
          <Switch
            checkedChildren="有"
            unCheckedChildren="无"
          />
        </Form.Item>

        <Form.Item
          label={"状态"}
          name={["status"]}
          valuePropName="checked"
          rules={[{ required: true, message: "请选择状态" }]}
        >
          <Switch
            checkedChildren="正常"
            unCheckedChildren="关闭"
          />
        </Form.Item>
      </Form>
    </Edit>
  );
};
