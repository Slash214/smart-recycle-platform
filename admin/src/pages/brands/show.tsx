import {
    DateField,
    Show,
    DeleteButton,
    useTable,
    RefreshButton,
} from '@refinedev/antd'
import { useShow } from '@refinedev/core'
import { useSelect } from '@refinedev/antd'
import { Typography, Tag, Image, Divider, Table, Space, Card, Button, Descriptions } from 'antd'
import { PlusOutlined, UnorderedListOutlined, EditOutlined } from '@ant-design/icons'
import React from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { getImageUrl } from '../../utils/image'
import type { BaseRecord } from '@refinedev/core'

const { Title, Text } = Typography

export const BrandShow = () => {
    const { query } = useShow({})
    const { data, isLoading } = query
    const navigate = useNavigate()
    const [searchParams] = useSearchParams()

    const record = data?.data
    const id = record?.id
    const brandType = record?.ptypeId ?? record?.type ?? record?.typeId

    // 获取返回参数（从列表页传递过来的筛选状态和页码）
    const returnParams = searchParams.get('returnParams')

    // 返回列表页时，恢复之前的筛选状态和页码
    const handleBackToList = () => {
        if (returnParams) {
            // 如果有返回参数，将其传递回列表页
            navigate(`/brands?returnParams=${encodeURIComponent(returnParams)}`)
        } else {
            // 否则直接返回列表页
            navigate('/brands')
        }
    }

    const { selectProps: productTypeSelectProps } = useSelect({
        resource: 'product-types',
        optionLabel: 'typeName',
        optionValue: 'id',
    })

    const productTypeName = productTypeSelectProps?.options?.find(
        (option) => option.value === brandType
    )?.label

    // 品牌详情列表
    const { tableProps } = useTable({
        resource: 'brand-details',
        syncWithLocation: false,
        filters: {
            permanent: [
                {
                    field: 'brandId',
                    operator: 'eq',
                    value: id,
                },
            ],
        },
    })

    // 自定义编辑按钮，确保传递 returnParams
    const handleEditClick = () => {
        if (!id) return

        if (returnParams) {
            navigate(`/brands/edit/${id}?returnParams=${encodeURIComponent(returnParams)}`)
        } else {
            navigate(`/brands/edit/${id}`)
        }
    }

    return (
        <Show
            isLoading={isLoading}
            headerButtons={() => (
                <>
                    {/* 自定义列表按钮，使用 handleBackToList 保持状态 */}
                    <Button icon={<UnorderedListOutlined />} onClick={handleBackToList}>
                        品牌列表
                    </Button>
                    {/* 自定义编辑按钮，确保传递 returnParams */}
                    <Button icon={<EditOutlined />} onClick={handleEditClick}>
                        编辑
                    </Button>
                    <DeleteButton />
                    <RefreshButton />
                    <Button onClick={handleBackToList}>返回列表</Button>
                </>
            )}
        >
            {/* 品牌基本信息 - 横向展示 */}
            <Card>
                <Descriptions bordered column={2}>
                    <Descriptions.Item label="ID">{record?.id}</Descriptions.Item>

                    <Descriptions.Item label="品牌名称">{record?.brand}</Descriptions.Item>

                    <Descriptions.Item label="Logo" span={2}>
                        {record?.logo ? (
                            <Image
                                src={getImageUrl(record.logo)}
                                alt="品牌Logo"
                                style={{
                                    maxWidth: '200px',
                                    maxHeight: '100px',
                                    objectFit: 'contain',
                                }}
                            />
                        ) : (
                            <Text type="secondary">无Logo</Text>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="产品类型">{productTypeName || '-'}</Descriptions.Item>

                    <Descriptions.Item label="有更新">
                        {(record?.updateinfo ?? record?.hasUpdate) === 1 ? (
                            <Tag color="blue">有</Tag>
                        ) : (
                            <Tag color="default">无</Tag>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="排序">{record?.orderNum || 0}</Descriptions.Item>

                    <Descriptions.Item label="状态">
                        {record?.status === 1 ? (
                            <Tag color="green">正常</Tag>
                        ) : (
                            <Tag color="red">关闭</Tag>
                        )}
                    </Descriptions.Item>

                    <Descriptions.Item label="创建时间">
                        <DateField value={record?.createdAt} format="YYYY年MM月DD日 HH:mm:ss" />
                    </Descriptions.Item>

                    <Descriptions.Item label="更新时间">
                        <DateField value={record?.updatedAt} format="YYYY年MM月DD日 HH:mm:ss" />
                    </Descriptions.Item>
                </Descriptions>
            </Card>

            {/* 品牌详情列表 */}
            <Divider />

            <Card
                title={
                    <Space>
                        <Title level={4} style={{ margin: 0 }}>
                            品牌详情
                        </Title>
                        <Text type="secondary">（该品牌的详细介绍内容）</Text>
                    </Space>
                }
                extra={
                    <Button
                        type="primary"
                        size="small"
                        icon={<PlusOutlined />}
                        onClick={() => {
                            // 构建跳转URL，保留returnParams以便返回时恢复状态
                            const params = new URLSearchParams()
                            params.set('brandId', String(record?.id))
                            if (returnParams) {
                                params.set('returnParams', returnParams)
                            }
                            navigate(`/brand-details/create?${params.toString()}`)
                        }}
                        disabled={!record?.id}
                    >
                        新建详情
                    </Button>
                }
                style={{ marginTop: 24 }}
            >
                <Table
                    {...tableProps}
                    rowKey="id"
                    pagination={{
                        ...tableProps.pagination,
                        pageSize: 10,
                        showSizeChanger: true,
                    }}
                >
                    <Table.Column dataIndex="id" title="ID" width={80} />

                    <Table.Column
                        dataIndex="content"
                        title="内容预览"
                        render={(value: string) => {
                            if (!value) return '-'
                            // 移除HTML标签并截取前50个字符
                            const textContent = value.replace(/<[^>]*>/g, '').substring(0, 50)
                            return textContent ? `${textContent}...` : '-'
                        }}
                    />

                    <Table.Column
                        dataIndex="imageUrls"
                        title="图片数量"
                        width={100}
                        render={(value: string[]) => {
                            if (!value || !Array.isArray(value)) return '0 张'
                            return `${value.length} 张`
                        }}
                    />

                    <Table.Column
                        dataIndex="status"
                        title="状态"
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
                        title="创建时间"
                        width={180}
                        render={(value: string) => (
                            <DateField value={value} format="YYYY年MM月DD日 HH:mm:ss" />
                        )}
                    />

                    <Table.Column
                        title="操作"
                        dataIndex="actions"
                        width={140}
                        fixed="right"
                        render={(_, record: BaseRecord) => (
                            <Space>
                                <Button
                                    type="link"
                                    size="small"
                                    onClick={() => navigate(`/brand-details/create?brandId=${record.brandId || id}`)}
                                >
                                    编辑详情
                                </Button>
                            </Space>
                        )}
                    />
                </Table>
            </Card>
        </Show>
    )
}
