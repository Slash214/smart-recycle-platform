import { Edit, useForm } from '@refinedev/antd'
import { useSelect } from '@refinedev/antd'
import { Form, Input, Select, Switch, Space, Button, message, Modal, Image, Progress } from 'antd'
import { PlusOutlined, MinusCircleOutlined, CameraOutlined, EyeOutlined } from '@ant-design/icons'
import React, { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router'
import { RichTextEditor } from '../../components'
import { captureHTMLToImages, previewHTMLAsImage } from '../../utils/screenshot'

interface BrandDetailFormValues {
    id: number
    brandId: number
    content: string
    imageUrls: string[]
    status: boolean | number
}

export const BrandDetailEdit = () => {
    const navigate = useNavigate()
    const [isCapturing, setIsCapturing] = useState(false)
    const [previewVisible, setPreviewVisible] = useState(false)
    const [previewImage, setPreviewImage] = useState('')
    const [captureStep, setCaptureStep] = useState('')
    const [uploadProgress, setUploadProgress] = useState(0)
    const [uploadStep, setUploadStep] = useState('')
    const [searchParams] = useSearchParams()
    const returnParams = searchParams.get('returnParams')
    const { formProps, saveButtonProps } = useForm<BrandDetailFormValues>({
        redirect: false, // 禁用默认跳转，使用自定义跳转逻辑
    })

    const { selectProps: brandSelectProps } = useSelect({
        resource: 'brands',
        optionLabel: 'brand',
        optionValue: 'id',
    })

    // 预览截图
    const handlePreview = async () => {
        const content = formProps.form?.getFieldValue('content')

        if (!content || content.trim() === '') {
            message.warning('请先输入内容再预览')
            return
        }

        setIsCapturing(true)
        message.loading({ content: '正在生成预览...', key: 'preview', duration: 0 })

        try {
            const dataUrl = await previewHTMLAsImage(content)
            setPreviewImage(dataUrl)
            setPreviewVisible(true)
            message.success({ content: '预览生成成功！', key: 'preview' })
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('预览失败:', error)
            }
            message.error({ content: '预览生成失败，请重试', key: 'preview' })
        } finally {
            setIsCapturing(false)
        }
    }

    // 处理截图并上传
    const handleCapture = async () => {
        const content = formProps.form?.getFieldValue('content')

        if (!content || content.trim() === '') {
            message.warning('请先输入内容再截图')
            return
        }

        setIsCapturing(true)
        setCaptureStep('准备截图...')
        message.loading({ content: '准备截图...', key: 'capture', duration: 0 })

        try {
            // 先生成预览确认内容正确
            setCaptureStep('生成预览确认...')
            message.loading({ content: '生成预览确认...', key: 'capture', duration: 0 })

            const previewDataUrl = await previewHTMLAsImage(content)

            // 检查预览是否有内容
            if (!previewDataUrl || previewDataUrl.length < 1000) {
                throw new Error('截图内容为空，请检查富文本内容')
            }

            setCaptureStep('正在截图并上传...')
            setUploadProgress(0)
            setUploadStep('准备截图...')
            message.loading({ content: '正在截图并上传...', key: 'capture', duration: 0 })

            const imageUrls = await captureHTMLToImages(
                content,
                {
                    maxHeight: 4200,
                    quality: 0.95,
                },
                (current, total, step) => {
                    // 更新进度
                    const percent = total > 0 ? Math.round((current / total) * 100) : 0
                    setUploadProgress(percent)
                    setUploadStep(step)
                    setCaptureStep(step)
                }
            )

            if (!imageUrls || imageUrls.length === 0) {
                throw new Error('上传失败，未获取到图片URL')
            }

            // 将图片 URL 设置到表单
            formProps.form?.setFieldValue('imageUrls', imageUrls)

            setCaptureStep('')
            setUploadStep('')
            setUploadProgress(0)
            message.success({
                content: `截图成功！共生成 ${imageUrls.length} 张图片`,
                key: 'capture',
                duration: 3,
            })
        } catch (error) {
            if (import.meta.env.DEV) {
                console.error('截图失败:', error)
            }
            setCaptureStep('')
            setUploadStep('')
            setUploadProgress(0)
            message.error({
                content: error instanceof Error ? error.message : '截图失败，请重试',
                key: 'capture',
                duration: 5,
            })
        } finally {
            setIsCapturing(false)
        }
    }

    return (
        <Edit saveButtonProps={saveButtonProps}>
            <Form
                {...formProps}
                layout="vertical"
                onFinish={async (values) => {
                    // 将Switch的boolean值转换为1/0,确保imageUrls是数组
                    const typedValues = values as BrandDetailFormValues
                    const submitData = {
                        ...typedValues,
                        status: typedValues.status ? 1 : 0,
                        imageUrls: typedValues.imageUrls || [],
                    }
                    // eslint-disable-next-line @typescript-eslint/no-explicit-any
                    // const result = await formProps.onFinish?.(submitData as any)
                    // // 成功后从表单中获取 brandId，然后跳转到品牌详情页；如果没有则跳转到品牌列表页
                    // const brandId = formProps.form?.getFieldValue('brandId')
                    const result = await formProps.onFinish?.(submitData as any)
                    const brandId = formProps.form?.getFieldValue('brandId')
                    if (!brandId) {
                        navigate('/brands')
                        return result
                    }

                    if (returnParams) {
                        navigate(
                            `/brands/show/${brandId}?returnParams=${encodeURIComponent(
                                returnParams
                            )}`
                        )
                    } else {
                        navigate(`/brands/show/${brandId}`)
                    }

                    return result
                }}
            >
                <Form.Item label={'ID'} name={['id']} rules={[{ required: true }]} hidden>
                    <Input readOnly />
                </Form.Item>

                <Form.Item
                    label={'品牌'}
                    name={['brandId']}
                    rules={[
                        {
                            required: true,
                            message: '请选择品牌',
                        },
                    ]}
                >
                    <Select {...brandSelectProps} placeholder="请选择品牌" />
                </Form.Item>

                <Form.Item
                    label={'内容'}
                    name={['content']}
                    rules={[
                        {
                            required: true,
                            message: '请输入内容',
                        },
                    ]}
                >
                    <RichTextEditor
                        value={formProps.form?.getFieldValue('content')}
                        onChange={(val) => {
                            formProps.form?.setFieldValue('content', val)
                        }}
                        height={500}
                    />
                </Form.Item>

                <Form.Item label="截图操作">
                    <Space direction="vertical" style={{ width: '100%' }}>
                        <Space style={{ width: '100%' }}>
                            <Button
                                icon={<EyeOutlined />}
                                onClick={handlePreview}
                                loading={isCapturing}
                                disabled={isCapturing}
                            >
                                预览截图效果
                            </Button>
                            <Button
                                type="primary"
                                icon={<CameraOutlined />}
                                onClick={handleCapture}
                                loading={isCapturing}
                                disabled={isCapturing}
                            >
                                {isCapturing ? captureStep || '处理中...' : '截图并上传'}
                            </Button>
                        </Space>
                        <div style={{ color: '#666', fontSize: 12 }}>
                            💡
                            建议先预览确认截图效果，再点击"截图并上传"按钮。如果内容较长会自动分段截图。
                        </div>
                        {isCapturing && (
                            <div style={{ width: '100%', marginTop: 16 }}>
                                {uploadStep && (
                                    <div
                                        style={{ color: '#1890ff', fontSize: 12, marginBottom: 8 }}
                                    >
                                        ⏳ {uploadStep}
                                    </div>
                                )}
                                {uploadProgress > 0 && (
                                    <Progress
                                        percent={uploadProgress}
                                        status="active"
                                        strokeColor={{
                                            '0%': '#108ee9',
                                            '100%': '#87d068',
                                        }}
                                    />
                                )}
                                {captureStep && !uploadStep && (
                                    <div style={{ color: '#1890ff', fontSize: 12, marginTop: 8 }}>
                                        ⏳ {captureStep}
                                    </div>
                                )}
                            </div>
                        )}
                    </Space>
                </Form.Item>

                <Form.Item label={'图片URL列表'} name={['imageUrls']}>
                    <Form.List name={['imageUrls']}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space
                                        key={key}
                                        style={{ display: 'flex', marginBottom: 8 }}
                                        align="baseline"
                                    >
                                        <Form.Item
                                            {...restField}
                                            name={[name]}
                                            rules={[
                                                { required: true, message: '请输入图片URL' },
                                                {
                                                    pattern: /^[^\s]+$/,
                                                    message: '请输入有效的图片路径',
                                                },
                                            ]}
                                        >
                                            <Input
                                                placeholder="请输入图片URL"
                                                style={{ width: '500px' }}
                                            />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button
                                        type="dashed"
                                        onClick={() => add()}
                                        block
                                        icon={<PlusOutlined />}
                                    >
                                        添加图片URL
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>

                <Form.Item
                    label={'状态'}
                    name={['status']}
                    valuePropName="checked"
                    getValueFromEvent={(checked) => checked}
                    getValueProps={(value) => ({ checked: value === 1 })}
                    rules={[{ required: true, message: '请选择状态' }]}
                >
                    <Switch checkedChildren="正常" unCheckedChildren="关闭" />
                </Form.Item>
            </Form>

            {/* 预览模态框 */}
            <Modal
                open={previewVisible}
                title="截图预览"
                footer={null}
                onCancel={() => setPreviewVisible(false)}
                width={880}
                centered
            >
                <div style={{ textAlign: 'center' }}>
                    <p style={{ marginBottom: 16, color: '#666' }}>
                        ✅ 请确认截图效果是否正确，然后再点击"截图并上传"按钮
                    </p>
                    {previewImage && (
                        <Image
                            src={previewImage}
                            alt="预览"
                            style={{ maxWidth: '100%', border: '1px solid #d9d9d9' }}
                        />
                    )}
                </div>
            </Modal>
        </Edit>
    )
}
