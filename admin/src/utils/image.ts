/**
 * 图片 URL 工具函数
 */

import { IMAGE_CDN_DOMAIN } from '../constants/app';

/**
 * 从完整的图片 URL 中提取路径部分
 * @param fullUrl 完整的图片 URL
 * @returns 路径部分（包含开头的 /）
 * 
 * @example
 * extractImagePath('http://t3z1yzgg5.hn-bkt.clouddn.com/photo-123.webp')
 * // 返回: '/photo-123.webp'
 */
export const extractImagePath = (fullUrl: string): string => {
  if (!fullUrl) return '';
  
  try {
    const url = new URL(fullUrl);
    return url.pathname; // 返回路径部分，例如 '/photo-123.webp'
  } catch {
    // 如果不是完整 URL，可能已经是路径了
    if (fullUrl.startsWith('/')) {
      return fullUrl;
    }
    // 如果只是文件名，添加 /
    return '/' + fullUrl;
  }
};

/**
 * 将图片路径转换为完整的 CDN URL
 * @param path 图片路径（可以是相对路径或完整 URL）
 * @returns 完整的 CDN URL
 * 
 * @example
 * getImageUrl('/photo-123.webp')
 * // 返回: 'http://t3z1yzgg5.hn-bkt.clouddn.com/photo-123.webp'
 * 
 * getImageUrl('http://t3z1yzgg5.hn-bkt.clouddn.com/photo-123.webp')
 * // 返回: 'http://t3z1yzgg5.hn-bkt.clouddn.com/photo-123.webp'
 */
export const getImageUrl = (path: string): string => {
  if (!path) return '';
  
  // 如果已经是完整的 URL，直接返回
  if (path.startsWith('http://') || path.startsWith('https://')) {
    return path;
  }
  
  // 确保路径以 / 开头
  const normalizedPath = path.startsWith('/') ? path : '/' + path;
  
  // 拼接 CDN 域名
  return IMAGE_CDN_DOMAIN + normalizedPath;
};

/**
 * 将图片值归一化为 key（用于入库）
 * 支持完整 URL、/path、纯 key 三种输入
 */
export const normalizeImageKey = (value: string): string => {
  if (!value) return '';

  // 完整 URL -> 取 pathname 最后一段
  if (value.startsWith('http://') || value.startsWith('https://')) {
    try {
      const { pathname } = new URL(value);
      return pathname.split('/').filter(Boolean).pop() || '';
    } catch {
      return '';
    }
  }

  // /path/to/file.jpg -> file.jpg
  if (value.startsWith('/')) {
    return value.split('/').filter(Boolean).pop() || '';
  }

  // 已是 key
  return value;
};

/**
 * 检查是否是有效的图片路径
 * @param path 图片路径
 * @returns 是否有效
 */
export const isValidImagePath = (path: string): boolean => {
  if (!path) return false;
  
  const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.bmp', '.svg'];
  const lowerPath = path.toLowerCase();
  
  return imageExtensions.some(ext => lowerPath.endsWith(ext));
};

