import { Create } from "@refinedev/antd";
import { Form, Input, Button, message, Modal, Image, Progress, Space } from "antd";
import { PlusOutlined, MinusCircleOutlined, CameraOutlined, EyeOutlined, ArrowsAltOutlined } from "@ant-design/icons";
import React, { useEffect, useState } from "react";
import { useSearchParams, useNavigate } from "react-router";
import { RichTextEditor } from "../../components";
import { API_URL } from "../../constants/app";
import { getAuthHeaders } from "../../utils/auth";
import { captureHTMLToImages, previewHTMLAsImage } from "../../utils/screenshot";

export const BrandDetailCreate = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [form] = Form.useForm();
    const [loading, setLoading] = useState(false);
    const [isCapturing, setIsCapturing] = useState(false);
    const [previewVisible, setPreviewVisible] = useState(false);
    const [editorFullscreenVisible, setEditorFullscreenVisible] = useState(false);
    const [previewImage, setPreviewImage] = useState("");
    const [captureStep, setCaptureStep] = useState("");
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadStep, setUploadStep] = useState("");
    const brandIdFromUrl = searchParams.get("brandId");
    const returnParams = searchParams.get("returnParams");
    const fullscreenEditorHeight = typeof window !== "undefined" ? Math.floor(window.innerHeight * 0.7) : 700;

    useEffect(() => {
        if (!brandIdFromUrl) return;
        const load = async () => {
            const res = await fetch(`${API_URL}/brands/${brandIdFromUrl}/details`, {
                headers: getAuthHeaders(false),
            });
            const payload = await res.json().catch(() => ({}));
            const detail = payload?.data;
            if (detail) {
                form.setFieldsValue({
                    content: detail.content || "",
                    imageUrls: Array.isArray(detail.imageUrls) ? detail.imageUrls : [],
                });
            }
        };
        load();
    }, [brandIdFromUrl, form]);

    const handlePreview = async () => {
        const content = form.getFieldValue("content");
        if (!content || String(content).trim() === "") {
            message.warning("请先输入内容再预览");
            return;
        }
        setIsCapturing(true);
        message.loading({ content: "正在生成预览...", key: "preview", duration: 0 });
        try {
            const dataUrl = await previewHTMLAsImage(content);
            setPreviewImage(dataUrl);
            setPreviewVisible(true);
            message.success({ content: "预览生成成功！", key: "preview" });
        } catch (error) {
            message.error({ content: "预览生成失败，请重试", key: "preview" });
        } finally {
            setIsCapturing(false);
        }
    };

    const handleCapture = async () => {
        const content = form.getFieldValue("content");
        if (!content || String(content).trim() === "") {
            message.warning("请先输入内容再截图");
            return;
        }
        setIsCapturing(true);
        setCaptureStep("准备截图...");
        message.loading({ content: "准备截图...", key: "capture", duration: 0 });
        try {
            setCaptureStep("正在截图并上传...");
            setUploadProgress(0);
            setUploadStep("准备截图...");
            const imageUrls = await captureHTMLToImages(
                content,
                { maxHeight: 3000, quality: 0.85 },
                (current, total, step) => {
                    const percent = total > 0 ? Math.round((current / total) * 100) : 0;
                    setUploadProgress(percent);
                    setUploadStep(step);
                    setCaptureStep(step);
                }
            );
            if (!imageUrls || imageUrls.length === 0) {
                throw new Error("上传失败，未获取到图片URL");
            }
            form.setFieldValue("imageUrls", imageUrls);
            setCaptureStep("");
            setUploadStep("");
            setUploadProgress(0);
            message.success({ content: `截图成功！共生成 ${imageUrls.length} 张图片`, key: "capture" });
        } catch (error) {
            setCaptureStep("");
            setUploadStep("");
            setUploadProgress(0);
            message.error({
                content: error instanceof Error ? error.message : "截图失败，请重试",
                key: "capture",
            });
        } finally {
            setIsCapturing(false);
        }
    };

    const handleSubmit = async (values: { content?: string; imageUrls?: string[] }) => {
        if (!brandIdFromUrl) {
            message.error("缺少品牌ID");
            return;
        }
        const content = (values.content || "").trim();
        const imageUrls = Array.isArray(values.imageUrls)
            ? values.imageUrls.map((v) => String(v || "").trim()).filter(Boolean)
            : [];
        if (!content && imageUrls.length === 0) {
            message.error("content 和 imageUrls 不能同时为空");
            return;
        }

        setLoading(true);
        try {
            const res = await fetch(`${API_URL}/brands/${brandIdFromUrl}/details`, {
                method: "PUT",
                headers: getAuthHeaders(true),
                body: JSON.stringify({ content, imageUrls }),
            });
            const payload = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(payload?.message || "保存失败");
            message.success(payload?.message || "更新成功");
            if (returnParams) {
                navigate(`/brands/show/${brandIdFromUrl}?returnParams=${encodeURIComponent(returnParams)}`);
            } else {
                navigate(`/brands/show/${brandIdFromUrl}`);
            }
        } catch (error) {
            message.error(error instanceof Error ? error.message : "保存失败");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Create
            saveButtonProps={{ loading, onClick: () => form.submit() }}
            headerButtons={() => (
                <Button onClick={() => navigate(brandIdFromUrl ? `/brands/show/${brandIdFromUrl}` : "/brands")}>
                    返回品牌页
                </Button>
            )}
        >
            <Form form={form} layout="vertical" onFinish={handleSubmit}>
                <Form.Item label={"图文内容"} name={"content"}>
                    <RichTextEditor
                        value={form.getFieldValue("content")}
                        onChange={(val) => form.setFieldValue("content", val)}
                        height={500}
                    />
                </Form.Item>
                <Form.Item>
                    <Button icon={<ArrowsAltOutlined />} onClick={() => setEditorFullscreenVisible(true)}>
                        全屏编辑
                    </Button>
                </Form.Item>

                <Form.Item label="截图操作">
                    <Space direction="vertical" style={{ width: "100%" }}>
                        <Space>
                            <Button icon={<EyeOutlined />} onClick={handlePreview} loading={isCapturing} disabled={isCapturing}>
                                预览截图效果
                            </Button>
                            <Button type="primary" icon={<CameraOutlined />} onClick={handleCapture} loading={isCapturing} disabled={isCapturing}>
                                {isCapturing ? captureStep || "处理中..." : "截图并上传"}
                            </Button>
                        </Space>
                        {isCapturing && (
                            <div style={{ width: "100%" }}>
                                {uploadStep && <div style={{ color: "#1890ff", fontSize: 12, marginBottom: 8 }}>⏳ {uploadStep}</div>}
                                {uploadProgress > 0 && <Progress percent={uploadProgress} status="active" />}
                            </div>
                        )}
                    </Space>
                </Form.Item>

                <Form.Item label={"图片URL列表"} name={"imageUrls"} initialValue={[]}>
                    <Form.List name={"imageUrls"}>
                        {(fields, { add, remove }) => (
                            <>
                                {fields.map(({ key, name, ...restField }) => (
                                    <Space key={key} style={{ display: "flex", marginBottom: 8 }} align="baseline">
                                        <Form.Item
                                            {...restField}
                                            name={[name]}
                                            rules={[
                                                { required: true, message: "请输入图片URL" },
                                                { pattern: /^[^\s]+$/, message: "请输入有效的图片路径" },
                                            ]}
                                        >
                                            <Input placeholder="请输入图片URL" style={{ width: "500px" }} />
                                        </Form.Item>
                                        <MinusCircleOutlined onClick={() => remove(name)} />
                                    </Space>
                                ))}
                                <Form.Item>
                                    <Button type="dashed" onClick={() => add()} block icon={<PlusOutlined />}>
                                        添加图片URL
                                    </Button>
                                </Form.Item>
                            </>
                        )}
                    </Form.List>
                </Form.Item>
            </Form>

            <Modal open={previewVisible} title="截图预览" footer={null} onCancel={() => setPreviewVisible(false)} width={880} centered>
                <div style={{ textAlign: "center" }}>
                    {previewImage && <Image src={previewImage} alt="预览" style={{ maxWidth: "100%", border: "1px solid #d9d9d9" }} />}
                </div>
            </Modal>

            <Modal
                open={editorFullscreenVisible}
                title="全屏编辑图文内容"
                onCancel={() => setEditorFullscreenVisible(false)}
                onOk={() => setEditorFullscreenVisible(false)}
                width="95vw"
                style={{ top: 16 }}
                okText="完成"
                cancelText="关闭"
            >
                <RichTextEditor
                    value={form.getFieldValue("content")}
                    onChange={(val) => form.setFieldValue("content", val)}
                    height={fullscreenEditorHeight}
                />
            </Modal>
        </Create>
    );
};
