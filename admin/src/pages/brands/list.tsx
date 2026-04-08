import {
  DateField,
  DeleteButton,
  List,
  useTable,
} from "@refinedev/antd";
import { useList } from "@refinedev/core";
import { type BaseRecord } from "@refinedev/core";
import { Space, Table, Tag, Image, Typography, Button, Select, message } from "antd";
import { FileTextOutlined, CheckCircleOutlined, EditOutlined, EyeOutlined } from "@ant-design/icons";
import React, { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { getImageUrl } from "../../utils/image";
import { useNavigate, useSearchParams } from "react-router";
import { API_URL } from "../../constants/app";
import { getAuthHeaders } from "../../utils/auth";

const { Text } = Typography;

export const BrandList = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const isInitialized = useRef(false);
  const returnParamsProcessed = useRef(false);
  
  // 从 URL 参数读取初始 ptypeId（使用 null 表示"全部"，避免 undefined 与 antd Select 冲突）
  const urlType = searchParams.get('ptypeId');
  const [selectedType, setSelectedType] = useState<number | null>(
    urlType ? parseInt(urlType) : null
  );

  // 获取产品类型列表（使用 useList 避免创建不必要的 form 实例）
  const { result: productTypesResult, query: productTypesQuery } = useList({
    resource: "product-types",
    pagination: {
      pageSize: 100,
    },
  });

  // 将产品类型数据转换为 Select 组件需要的 options 格式
  const productTypeOptions = useMemo(() => {
    if (import.meta.env.DEV) {
      console.log('productTypesResult:', productTypesResult);
      console.log('productTypesQuery:', productTypesQuery);
    }
    
    // useList 返回 { result: { data: [...], total: ... }, query: {...} }
    const dataArray = productTypesResult?.data;
    
    if (!dataArray || !Array.isArray(dataArray)) {
      if (import.meta.env.DEV) {
        console.warn('productTypesResult.data is not an array:', dataArray);
      }
      return [];
    }
    
    // 强制转换为 number，避免类型不一致
    const options = dataArray.map((item: BaseRecord) => ({
      label: item.typeName,
      value: Number(item.id),
    }));
    
    if (import.meta.env.DEV) {
      console.log('productTypeOptions:', options);
    }
    
    // 在开头添加"全部"选项（使用 null 代替 undefined）
    return [
      { label: '全部', value: null },
      ...options
    ];
  }, [productTypesResult, productTypesQuery]);

  const productTypesLoading = productTypesQuery?.isLoading ?? false;

  // 使用 useTable，简化URL参数（只保留必要的 ptypeId 和分页参数）
  const { tableProps, setFilters } = useTable({
    syncWithLocation: true,
    filters: {
      permanent: selectedType !== null
        ? [
            {
              field: "ptypeId",
              operator: "eq",
              value: selectedType,
            },
          ]
        : [],
    },
  });

  // 统一的导航函数：保存当前状态并跳转
  const createNavigateWithState = useCallback((path: string) => {
    if (import.meta.env.DEV) {
      console.log('createNavigateWithState called with path:', path);
      console.log('selectedType:', selectedType);
      console.log('tableProps.pagination:', tableProps.pagination);
    }
    
    const params = new URLSearchParams();
    
    // 保存当前的一级类目筛选
    if (selectedType !== null) {
      params.set('ptypeId', selectedType.toString());
    }
    
    // 保存当前的分页信息
    const pagination = tableProps.pagination;
    const currentPage = (pagination && typeof pagination === 'object' && 'current' in pagination) 
      ? (typeof pagination.current === 'number' ? pagination.current : 1)
      : 1;
    const pageSize = (pagination && typeof pagination === 'object' && 'pageSize' in pagination) 
      ? (typeof pagination.pageSize === 'number' ? pagination.pageSize : 10)
      : 10;
    
    if (import.meta.env.DEV) {
      console.log('Saving pagination state:', { currentPage, pageSize, pagination });
    }
    
    // 确保值是有效的数字
    params.set('page', String(Math.max(1, currentPage)));
    params.set('pageSize', String(Math.max(1, pageSize)));
    
    // 将参数作为查询字符串传递
    const queryString = params.toString();
    const fullPath = `${path}${queryString ? `?returnParams=${encodeURIComponent(queryString)}` : ''}`;
    
    if (import.meta.env.DEV) {
      console.log('Navigating to:', fullPath);
    }
    
    navigate(fullPath);
  }, [navigate, selectedType, tableProps.pagination]);

  // 从 URL 参数恢复状态（仅处理从详情页/编辑页返回的情况）
  useEffect(() => {
    const returnParams = searchParams.get('returnParams');
    
    // 只处理 returnParams，不再反向同步 URL -> state
    if (!returnParams || returnParamsProcessed.current) {
      return;
    }
    
    try {
      const params = new URLSearchParams(decodeURIComponent(returnParams));
      const savedType = params.get('ptypeId');
      const savedPage = params.get('page');
      const savedPageSize = params.get('pageSize');
      
      if (import.meta.env.DEV) {
        console.log('Restoring state from returnParams:', { savedType, savedPage, savedPageSize });
      }
      
      // 恢复品牌类型筛选
      if (savedType) {
        const type = Number(savedType);
        setSelectedType(type);
        isInitialized.current = true;
        // 更新筛选器
        setFilters([
          {
            field: "ptypeId",
            operator: "eq",
            value: type,
          },
        ], "replace");
      } else {
        // 如果没有保存的type，清除筛选（使用 null 表示"全部"）
        setSelectedType(null);
        setFilters([], "replace");
      }
      
      // 恢复分页信息（通过更新URL参数，useTable会自动同步）
      // useTable 的 syncWithLocation 使用 currentPage 和 pageSize 作为 URL 参数名
      const newParams = new URLSearchParams(searchParams);
      if (savedType) {
        newParams.set('ptypeId', savedType);
      } else {
        newParams.delete('ptypeId');
      }
      
      // 确保分页参数是有效的数字
      const pageNum = savedPage && !isNaN(Number(savedPage)) ? Number(savedPage) : 1;
      const pageSizeNum = savedPageSize && !isNaN(Number(savedPageSize)) ? Number(savedPageSize) : 10;
      
      // 设置分页参数到 URL（useTable 的 syncWithLocation 会读取这些参数）
      newParams.set('currentPage', String(Math.max(1, pageNum)));
      newParams.set('pageSize', String(Math.max(1, pageSizeNum)));
      
      if (import.meta.env.DEV) {
        console.log('Restoring pagination:', { 
          savedPage, 
          savedPageSize, 
          pageNum, 
          pageSizeNum,
          newParams: newParams.toString() 
        });
      }
      
      // 移除 returnParams，避免重复处理
      newParams.delete('returnParams');
      returnParamsProcessed.current = true;
      
      // 更新 URL 参数，这会触发 useTable 重新获取数据并应用分页
      setSearchParams(newParams, { replace: true });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('Failed to parse returnParams:', error);
      }
      returnParamsProcessed.current = true;
    }
  }, [searchParams, setSearchParams, setFilters]);

  // 仅在真正首次访问时默认选中第一个产品类型
  useEffect(() => {
    // 如果已经初始化过，不再执行
    if (isInitialized.current) {
      return;
    }
    
    // 如果已经有 URL 参数中的 ptypeId，标记为已初始化
    if (urlType) {
      isInitialized.current = true;
      return;
    }
    
    // 如果用户已经手动选择了类型，标记为已初始化
    if (selectedType !== null) {
      isInitialized.current = true;
      return;
    }
    
    // 只有在真正首次加载且没有选中任何类型时才默认选中第一个产品类型（跳过"全部"选项）
    if (
      selectedType === null &&
      productTypeOptions &&
      productTypeOptions.length > 1 // 至少有"全部"和一个产品类型
    ) {
      // 跳过第一个"全部"选项（value === null），选择第一个实际的产品类型
      const firstProductType = productTypeOptions.find(opt => opt.value !== null);
      if (firstProductType && firstProductType.value !== null) {
        const firstType = firstProductType.value as number;
        setSelectedType(firstType);
        // 同时更新 URL 参数
        const newParams = new URLSearchParams(searchParams);
        newParams.set('ptypeId', firstType.toString());
        setSearchParams(newParams, { replace: true });
        isInitialized.current = true;
      }
    }
  }, [productTypeOptions, urlType, searchParams, setSearchParams, selectedType]);

  // 处理产品类型变化（用户手动选择时）
  const handleTypeChange = useCallback((value: number | null) => {
    if (import.meta.env.DEV) {
      console.log('handleTypeChange value:', value);
    }
    
    // 标记为已初始化，防止初始化逻辑再次执行
    isInitialized.current = true;
    setSelectedType(value);
    
    // 更新 URL 参数，重置到第一页
    const newParams = new URLSearchParams(searchParams);
    if (value !== null) {
      newParams.set('ptypeId', value.toString());
    } else {
      newParams.delete('ptypeId');
    }
    newParams.set('currentPage', '1');
    setSearchParams(newParams, { replace: false });
    
    // 更新筛选器，重置到第一页
    if (value !== null) {
      setFilters([
        {
          field: "ptypeId",
          operator: "eq",
          value: value,
        },
      ], "replace");
    } else {
      setFilters([], "replace");
    }
  }, [searchParams, setSearchParams, setFilters]);

  // 缓存产品类型映射
  const typeIdToLabelMap = useMemo(() => {
    const map = new Map<number, string>();
    productTypeOptions?.forEach((option) => {
      if (option.value !== null && option.value !== undefined) {
        map.set(option.value as number, option.label as string);
      }
    });
    return map;
  }, [productTypeOptions]);

  // 处理今日更新
  const handleMarkTodayUpdate = useCallback(async (brandId: number) => {
    try {
      const response = await fetch(`${API_URL}/brands/${brandId}/mark-today-update`, {
        method: "POST",
        headers: getAuthHeaders(true),
        body: JSON.stringify({}),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || "请求失败");
      }

      const result = await response.json();
      
      if (result.code === 200 && result.data) {
        const { message: apiMessage, deletedInteractions } = result.data;
        message.success(apiMessage || `已删除 ${deletedInteractions || 0} 条用户浏览记录，品牌已标记为今日更新`);
        setFilters([], "replace");
      } else {
        message.success(result.data?.message || result.message || "标记成功");
        setFilters([], "replace");
      }
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error("标记今日更新失败:", error);
      }
      message.error(error instanceof Error ? error.message : "标记失败，请重试");
    }
  }, [setFilters]);

  // 操作列渲染函数
  const renderActions = useMemo(() => {
    return (_: unknown, record: BaseRecord) => {
      const handleEditClick = () => {
        if (import.meta.env.DEV) {
          console.log('Edit button clicked for record:', record.id);
        }
        createNavigateWithState(`/brands/edit/${record.id}`);
      };
      
      const handleShowClick = () => {
        if (import.meta.env.DEV) {
          console.log('Show button clicked for record:', record.id);
        }
        createNavigateWithState(`/brands/show/${record.id}`);
      };
      
      const handleDetailClick = () => {
        if (import.meta.env.DEV) {
          console.log('Detail button clicked for record:', record.id);
        }
        createNavigateWithState(`/brands/show/${record.id}`);
      };
      
      return (
        <Space>
          {/* 统一的编辑按钮，带状态保存 */}
          <Button
            type="link"
            size="small"
            icon={<EditOutlined />}
            onClick={handleEditClick}
            title="编辑"
          />
          
          {/* 统一的查看按钮，带状态保存 */}
          <Button
            type="link"
            size="small"
            icon={<EyeOutlined />}
            onClick={handleShowClick}
            title="查看"
          />
          
          {/* 详情按钮 */}
          <Button
            type="link"
            size="small"
            icon={<FileTextOutlined />}
            onClick={handleDetailClick}
            title="管理详情"
          >
            详情
          </Button>
          
          {/* 今日更新按钮 */}
          <Button
            type="link"
            size="small"
            icon={<CheckCircleOutlined />}
            onClick={() => handleMarkTodayUpdate(record.id as number)}
            title="今日更新"
          >
            今日更新
          </Button>
          
          {/* 删除按钮 */}
          <DeleteButton hideText size="small" recordItemId={record.id} />
        </Space>
      );
    };
  }, [createNavigateWithState, handleMarkTodayUpdate]);

  return (
    <List
      createButtonProps={{
        children: "新建",
        onClick: () => createNavigateWithState('/brands/create')
      }}
      headerButtons={({ defaultButtons }) => (
        <>
          <Select
            style={{ width: 200 }}
            placeholder="选择产品类型"
            value={selectedType}
            onChange={handleTypeChange}
            options={productTypeOptions}
            loading={productTypesLoading}
            notFoundContent={productTypesLoading ? "加载中..." : "暂无数据"}
            allowClear={false}
          />
          {defaultButtons}
        </>
      )}
    >
      <Table 
        {...tableProps} 
        rowKey="id"
        pagination={{
          ...tableProps.pagination,
          // 确保分页参数是有效的数字，避免 NaN
          current: (tableProps.pagination && typeof tableProps.pagination === 'object' && 'current' in tableProps.pagination)
            ? (typeof tableProps.pagination.current === 'number' && !isNaN(tableProps.pagination.current) 
                ? tableProps.pagination.current 
                : 1)
            : 1,
          pageSize: (tableProps.pagination && typeof tableProps.pagination === 'object' && 'pageSize' in tableProps.pagination)
            ? (typeof tableProps.pagination.pageSize === 'number' && !isNaN(tableProps.pagination.pageSize) 
                ? tableProps.pagination.pageSize 
                : 10)
            : 10,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条`,
          pageSizeOptions: ['10', '20', '50', '100'],
        }}
      >
        <Table.Column dataIndex="id" title={"ID"} width={80} />
        
        <Table.Column
          dataIndex="brand"
          title={"品牌名称"}
          render={(value: string) => value || "-"}
        />
        
        <Table.Column
          dataIndex="logo"
          title={"品牌Logo"}
          width={120}
          render={(value: string) =>
            value ? (
              <Image
                src={getImageUrl(value)}
                alt="品牌Logo"
                width={80}
                height={60}
                style={{ objectFit: "contain" }}
              />
            ) : (
              <Text type="secondary">无Logo</Text>
            )
          }
        />
        
        <Table.Column
          dataIndex="ptypeId"
          title={"产品类型"}
          width={120}
          render={(value: number) => typeIdToLabelMap.get(value) || "-"}
        />
        
        <Table.Column
          dataIndex="updateinfo"
          title={"有更新"}
          width={100}
          render={(value: number) =>
            value === 1 ? (
              <Tag color="blue">有</Tag>
            ) : (
              <Tag color="default">无</Tag>
            )
          }
        />
        
        <Table.Column
          dataIndex="orderNum"
          title={"排序"}
          width={80}
          render={(value: number) => value || 0}
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
          width={250}
          fixed="right"
          render={renderActions}
        />
      </Table>
    </List>
  );
};
