import { snapdom } from '@zumer/snapdom';
import { API_URL } from '../constants/app';
import { extractImagePath } from './image';
import { getAuthHeadersForUpload, getToken } from './auth';

/**
 * 截图配置选项
 */
interface ScreenshotOptions {
  maxHeight?: number; // 单张图片的最大高度（像素）
  quality?: number; // 图片质量 0-1
  backgroundColor?: string; // 背景色
}

/**
 * 将 Blob 转换为 File
 */
function blobToFile(blob: Blob, fileName: string): File {
  return new File([blob], fileName, { type: blob.type });
}

/**
 * 上传图片到服务器（支持进度回调）
 * @param file 要上传的文件
 * @param onProgress 进度回调函数 (0-100)
 * @returns 返回相对路径（不包含CDN域名）
 */
async function uploadImage(file: File, onProgress?: (percent: number) => void): Promise<string> {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append('file', file);

    const xhr = new XMLHttpRequest();
    const token = getToken();

    // 监听上传进度
    xhr.upload.addEventListener('progress', (event) => {
      if (event.lengthComputable && onProgress) {
        const percent = Math.round((event.loaded / event.total) * 100);
        onProgress(percent);
      }
    });

    // 监听请求完成
    xhr.addEventListener('load', () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          
          // 获取后端返回的URL或路径
          let imageUrl = '';
          if (result.code === 200 && result.data) {
            imageUrl = result.data.path || result.data.url || result.data;
          } else {
            imageUrl = result.path || result.url || result;
          }
          
          // 提取相对路径，去掉CDN域名前缀
          // 这样即使CDN域名变更，数据库中的路径仍然有效
          resolve(extractImagePath(imageUrl));
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      } else {
        reject(new Error(`图片上传失败: ${xhr.statusText}`));
      }
    });

    // 监听错误
    xhr.addEventListener('error', () => {
      reject(new Error('网络错误，上传失败'));
    });

    // 监听取消
    xhr.addEventListener('abort', () => {
      reject(new Error('上传已取消'));
    });

    // 发送请求
    xhr.open('POST', `${API_URL}/files/images`);
    
    // 设置请求头
    if (token) {
      xhr.setRequestHeader('Authorization', `Bearer ${token}`);
    }
    
    xhr.send(formData);
  });
}

/**
 * 将 HTML 内容截图并上传到服务器
 * @param htmlContent HTML 内容字符串
 * @param options 截图选项
 * @param onProgress 进度回调函数 (current: 当前进度, total: 总数, step: 当前步骤)
 * @returns 返回上传后的图片相对路径数组（不包含CDN域名）
 */
export async function captureHTMLToImages(
  htmlContent: string,
  options: ScreenshotOptions = {},
  onProgress?: (current: number, total: number, step: string) => void
): Promise<string[]> {
  const {
    maxHeight = 3000, // 降低默认单张图片最大高度到 3000px，避免内存问题
    quality = 0.85, // 降低质量，减少文件大小
    backgroundColor = '#ffffff',
  } = options;

  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(255, 255, 255, 0.9)';
  overlay.style.zIndex = '9998';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.pointerEvents = 'none';
  overlay.style.overflow = 'auto'; // 遮罩层可以滚动，但容器本身不滚动
  
  // 添加提示文本
  const hint = document.createElement('div');
  hint.style.position = 'absolute';
  hint.style.top = '20px';
  hint.style.left = '50%';
  hint.style.transform = 'translateX(-50%)';
  hint.style.padding = '10px 20px';
  hint.style.backgroundColor = '#1890ff';
  hint.style.color = '#fff';
  hint.style.borderRadius = '4px';
  hint.style.fontSize = '14px';
  hint.textContent = '正在截图中，请稍候...';
  overlay.appendChild(hint);
  
  // 创建临时容器
  const container = document.createElement('div');
  container.style.width = '750px'; // 调整为750px，匹配表格宽度
  container.style.padding = '0'; // 移除 padding，避免空白区域
  container.style.margin = '0'; // 移除 margin
  container.style.backgroundColor = backgroundColor;
  container.style.fontFamily = 'Arial, sans-serif';
  // 不设置 maxHeight 和 overflow，让内容完全展开，避免滚动条
  container.innerHTML = htmlContent;
  
  // 为富文本内容添加适当的内边距，但不在容器级别
  const contentElement = container.firstElementChild as HTMLElement;
  if (contentElement) {
    contentElement.style.padding = '20px';
    contentElement.style.margin = '0';
  } else {
    // 如果没有包装元素，直接为容器添加内边距
    container.style.padding = '20px';
  }
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // 等待更长时间让内容完全渲染，包括图片加载
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    const images: string[] = [];
    const totalHeight = container.scrollHeight;

    // 验证容器是否有内容
    if (totalHeight === 0) {
      throw new Error('内容为空，无法截图');
    }

    // 如果内容高度小于最大高度，直接截图
    if (totalHeight <= maxHeight) {
      // 使用 SnapDOM 进行截图，降低 scale 避免内存问题
      const result = await snapdom.toBlob(container, {
        type: 'jpg',
        quality,
        backgroundColor,
        scale: 1.5, // 降低 scale 从 2 到 1.5，减少内存占用
        embedFonts: true, // 嵌入字体
        fast: false, // 关闭快速模式，提高稳定性
      });

      if (!result) {
        throw new Error('截图生成失败：返回结果为空');
      }

      // 验证 Blob 是否有效
      let blob: Blob;
      if (result instanceof Blob) {
        blob = result;
      } else if (result && typeof result === 'object' && 'byteLength' in result) {
        // 检查是否为 ArrayBuffer
        blob = new Blob([result as ArrayBuffer], { type: 'image/jpeg' });
      } else {
        throw new Error('截图生成失败：无效的返回类型');
      }

      // 验证 Blob 大小
      if (blob.size === 0) {
        throw new Error('截图生成失败：图片大小为 0');
      }

      const file = blobToFile(blob, `screenshot-${Date.now()}.jpg`);
      
      // 上传图片，显示进度
      if (onProgress) {
        onProgress(0, 1, '正在上传图片...');
      }
      
      const url = await uploadImage(file, (percent) => {
        if (onProgress) {
          onProgress(percent, 100, '正在上传图片...');
        }
      });
      
      if (onProgress) {
        onProgress(1, 1, '上传完成');
      }
      
      images.push(url);
    } else {
      // 内容太长，需要分段截图
      const segments = Math.ceil(totalHeight / maxHeight);
      
      // 移除主容器，避免重复显示
      overlay.removeChild(container);

      for (let i = 0; i < segments; i++) {
        const startY = i * maxHeight;
        const endY = Math.min((i + 1) * maxHeight, totalHeight);
        const segmentHeight = endY - startY;

        // 更新提示文本
        hint.textContent = `正在截图中... (${i + 1}/${segments})`;
        
        // 创建分段容器
        const segmentContainer = document.createElement('div');
        segmentContainer.style.width = '750px'; // 调整为750px，匹配表格宽度
        segmentContainer.style.height = `${segmentHeight}px`;
        segmentContainer.style.overflow = 'hidden';
        segmentContainer.style.padding = '0'; // 移除 padding，避免空白区域
        segmentContainer.style.margin = '0'; // 移除 margin
        segmentContainer.style.backgroundColor = backgroundColor;
        
        // 克隆内容并调整位置
        const clonedContent = container.cloneNode(true) as HTMLElement;
        clonedContent.style.position = 'relative';
        clonedContent.style.top = `-${startY}px`;
        clonedContent.style.padding = '0'; // 确保克隆的内容也没有额外 padding
        segmentContainer.appendChild(clonedContent);
        
        // 临时添加到 overlay 中
        overlay.appendChild(segmentContainer);
        
        // 等待内容渲染
        await new Promise(resolve => setTimeout(resolve, 200));

        // 使用 SnapDOM 进行分段截图，降低 scale 避免内存问题
        const result = await snapdom.toBlob(segmentContainer, {
          type: 'jpg',
          quality,
          backgroundColor,
          scale: 1.5, // 降低 scale 从 2 到 1.5，减少内存占用
          embedFonts: true,
          fast: false, // 关闭快速模式，提高稳定性
          height: segmentHeight,
        });

        if (!result) {
          throw new Error(`分段截图 ${i + 1} 生成失败：返回结果为空`);
        }

        // 验证 Blob 是否有效
        let blob: Blob;
        if (result instanceof Blob) {
          blob = result;
        } else if (result && typeof result === 'object' && 'byteLength' in result) {
          // 检查是否为 ArrayBuffer
          blob = new Blob([result as ArrayBuffer], { type: 'image/jpeg' });
        } else {
          throw new Error(`分段截图 ${i + 1} 生成失败：无效的返回类型`);
        }

        // 验证 Blob 大小
        if (blob.size === 0) {
          throw new Error(`分段截图 ${i + 1} 生成失败：图片大小为 0`);
        }

        const file = blobToFile(blob, `screenshot-${Date.now()}-${i + 1}.jpg`);
        
        // 上传图片，显示进度
        if (onProgress) {
          onProgress(i, segments, `正在上传第 ${i + 1}/${segments} 张图片...`);
        }
        
        const url = await uploadImage(file, (percent) => {
          if (onProgress) {
            // 计算总体进度：已完成的分段 + 当前分段的进度
            const overallProgress = i + (percent / 100);
            onProgress(Math.round(overallProgress), segments, `正在上传第 ${i + 1}/${segments} 张图片...`);
          }
        });
        
        images.push(url);
        
        if (onProgress && i === segments - 1) {
          onProgress(segments, segments, '所有图片上传完成');
        }

        // 清理分段容器
        overlay.removeChild(segmentContainer);
      }
    }

    return images;
  } finally {
    // 清理遮罩层和容器
    document.body.removeChild(overlay);
  }
}

/**
 * 将富文本内容转换为图片预览（不上传）
 * @param htmlContent HTML 内容字符串
 * @returns 返回 Data URL
 */
export async function previewHTMLAsImage(htmlContent: string): Promise<string> {
  // 创建遮罩层
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.inset = '0';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.zIndex = '9998';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.overflow = 'auto'; // 遮罩层可以滚动，但容器本身不滚动
  
  // 创建容器
  const container = document.createElement('div');
  container.style.width = '750px'; // 调整为750px，匹配表格宽度
  container.style.padding = '0'; // 移除 padding，避免空白区域
  container.style.margin = '0'; // 移除 margin
  container.style.backgroundColor = '#ffffff';
  container.style.fontFamily = 'Arial, sans-serif';
  // 不设置 maxHeight 和 overflow，让内容完全展开，避免滚动条
  container.innerHTML = htmlContent;
  
  // 为富文本内容添加适当的内边距，但不在容器级别
  const contentElement = container.firstElementChild as HTMLElement;
  if (contentElement) {
    contentElement.style.padding = '20px';
    contentElement.style.margin = '0';
  } else {
    // 如果没有包装元素，直接为容器添加内边距
    container.style.padding = '20px';
  }
  
  overlay.appendChild(container);
  document.body.appendChild(overlay);
  
  // 等待更长时间让内容完全渲染，包括图片加载
  await new Promise(resolve => setTimeout(resolve, 500));

  try {
    // 验证容器是否有内容
    if (container.scrollHeight === 0) {
      throw new Error('内容为空，无法生成预览');
    }

    // 使用 SnapDOM 生成预览，降低 scale 避免内存问题
    const img = await snapdom.toJpg(container, {
      quality: 0.85, // 降低质量
      backgroundColor: '#ffffff',
      scale: 1.5, // 降低 scale 从 2 到 1.5，减少内存占用
      embedFonts: true,
      fast: false, // 关闭快速模式，提高稳定性
    });

    // 检查返回值
    if (!img || !img.src) {
      throw new Error('截图生成失败');
    }

    return img.src;
  } finally {
    document.body.removeChild(overlay);
  }
}

