import React, { useState } from 'react';
import { Upload, message, Image, Button, Space } from 'antd';
import { PlusOutlined, DeleteOutlined, EyeOutlined, LoadingOutlined } from '@ant-design/icons';
import type { UploadProps } from 'antd';
import { getImageUrl } from '../../utils/image';
import { API_URL } from '../../constants/app';
import { getAuthHeadersForUpload } from '../../utils/auth';

interface ImageUploadProps {
  value?: string; // 图片 key 或 URL
  onChange?: (value: string) => void; // 值变化回调
  onKeyChange?: (key: string) => void; // key变化回调（用于删除）
  maxSize?: number; // 最大文件大小（MB），默认10MB
  accept?: string; // 接受的文件类型
  disabled?: boolean; // 是否禁用
}

interface UploadData {
  key?: string;
  url?: string;
}

interface UploadResponse {
  code?: number;
  message?: string;
  data?: UploadData;
  key?: string;
  url?: string;
}

/**
 * 图片上传组件
 * 
 * @example
 * // 基础用法
 * <Form.Item name="imgUrl" label="图片">
 *   <ImageUpload />
 * </Form.Item>
 * 
 * // 保存 key 用于删除
 * const [imageKey, setImageKey] = useState('');
 * <ImageUpload onKeyChange={setImageKey} />
 */
export const ImageUpload: React.FC<ImageUploadProps> = ({
  value,
  onChange,
  onKeyChange,
  maxSize = 10,
  accept = 'image/jpg,image/jpeg,image/png,image/gif,image/webp',
  disabled = false,
}) => {
  const [loading, setLoading] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);

  // 上传前的校验
  const beforeUpload = (file: File) => {
    const isImage = file.type.startsWith('image/');
    if (!isImage) {
      message.error('只能上传图片文件！');
      return false;
    }

    const isLtMaxSize = file.size / 1024 / 1024 < maxSize;
    if (!isLtMaxSize) {
      message.error(`图片大小不能超过 ${maxSize}MB！`);
      return false;
    }

    return true;
  };

  // 自定义上传逻辑
  const customUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    
    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_URL}/files/images`, {
        method: 'POST',
        headers: getAuthHeadersForUpload(),
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || '上传失败');
      }

      const data: UploadResponse = await response.json();
      const fileData = data?.data ?? data;
      const imageKey = fileData?.key;
      
      message.success('上传成功！');

      if (!imageKey) {
        throw new Error('上传成功但未返回图片 key');
      }

      // 触发表单值变化：按后端要求只保存 key
      onChange?.(imageKey);
      
      // 保存 key 用于后续删除
      onKeyChange?.(imageKey);
      
      onSuccess?.(data);
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('上传失败:', error);
      }
      message.error(error instanceof Error ? error.message : '上传失败，请重试');
      onError?.(error as Error);
    } finally {
      setLoading(false);
    }
  };

  // 删除图片
  const handleRemove = () => {
    onChange?.('');
    onKeyChange?.('');
    message.success('已移除图片');
  };

  // 预览图片
  const handlePreview = () => {
    setPreviewVisible(true);
  };

  return (
    <div className="image-upload-wrapper">
      {value ? (
        // 已上传状态
        <div style={{ position: 'relative', display: 'inline-block' }}>
          <Image
            src={getImageUrl(value)}
            alt="上传的图片"
            style={{
              width: 200,
              height: 200,
              objectFit: 'cover',
              borderRadius: 8,
              border: '1px solid #d9d9d9',
            }}
            preview={false}
          />
          
          {!disabled && (
            <Space
              style={{
                position: 'absolute',
                top: 8,
                right: 8,
              }}
            >
              <Button
                type="primary"
                size="small"
                icon={<EyeOutlined />}
                onClick={handlePreview}
              >
                预览
              </Button>
              <Button
                danger
                size="small"
                icon={<DeleteOutlined />}
                onClick={handleRemove}
              >
                删除
              </Button>
            </Space>
          )}
        </div>
      ) : (
        // 未上传状态
        <Upload
          name="file"
          listType="picture-card"
          showUploadList={false}
          beforeUpload={beforeUpload}
          customRequest={customUpload}
          accept={accept}
          disabled={disabled || loading}
        >
          <div>
            {loading ? <LoadingOutlined /> : <PlusOutlined />}
            <div style={{ marginTop: 8 }}>
              {loading ? '上传中...' : '上传图片'}
            </div>
          </div>
        </Upload>
      )}

      {/* 图片预览 Modal */}
      {value && (
        <Image
          src={getImageUrl(value)}
          alt="预览"
          style={{ display: 'none' }}
          preview={{
            visible: previewVisible,
            onVisibleChange: setPreviewVisible,
          }}
        />
      )}

      {/* 提示文字 */}
      <div style={{ marginTop: 8, color: '#8c8c8c', fontSize: 12 }}>
        支持 JPG、PNG、GIF、WebP 格式，最大 {maxSize}MB
      </div>
    </div>
  );
};

export default ImageUpload;

