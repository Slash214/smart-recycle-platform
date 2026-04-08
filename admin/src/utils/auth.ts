/**
 * 认证相关的工具函数
 */

/**
 * 从 localStorage 获取 token
 * SSR/非浏览器容错
 */
export const getToken = (): string | null => {
  try {
    return typeof window !== "undefined" ? localStorage.getItem("auth_token") : null;
  } catch {
    return null;
  }
};

/**
 * 解析 JWT token 获取 payload
 */
export const parseJWT = (token: string): any => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch {
    return null;
  }
};

/**
 * 检查 token 是否过期
 */
export const isTokenExpired = (token: string | null): boolean => {
  if (!token) return true;
  
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp 是 Unix 时间戳（秒），转换为毫秒
  const expTime = payload.exp * 1000;
  const now = Date.now();
  
  return now >= expTime;
};

/**
 * 检查 token 是否即将过期（在指定时间内过期）
 * @param token token 字符串
 * @param bufferMinutes 提前多少分钟刷新（默认 5 分钟）
 */
export const isTokenExpiringSoon = (token: string | null, bufferMinutes: number = 5): boolean => {
  if (!token) return true;
  
  const payload = parseJWT(token);
  if (!payload || !payload.exp) return true;
  
  // exp 是 Unix 时间戳（秒），转换为毫秒
  const expTime = payload.exp * 1000;
  const now = Date.now();
  const bufferTime = bufferMinutes * 60 * 1000; // 转换为毫秒
  
  return (expTime - now) <= bufferTime;
};

/**
 * 刷新 token（当前管理员接口无刷新端点）
 * 这里退化为本地有效性判断：未过期即视为可继续使用
 */
export const refreshToken = async (): Promise<boolean> => {
  try {
    const token = getToken();
    if (!token) return false;
    return !isTokenExpired(token);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("刷新 token 失败:", error);
    }
    return false;
  }
};

/**
 * 生成带认证信息的请求头
 * @param includeContentType 是否包含 Content-Type 头（默认 true）
 * @returns 请求头对象
 */
export const getAuthHeaders = (includeContentType: boolean = true): HeadersInit => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  if (includeContentType) {
    headers["Content-Type"] = "application/json";
  }
  return headers;
};

/**
 * 生成带认证信息的请求头（用于 FormData 上传，不包含 Content-Type）
 * @returns 请求头对象
 */
export const getAuthHeadersForUpload = (): HeadersInit => {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

