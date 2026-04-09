import { DataProvider } from "@refinedev/core";
import { mockBanners } from "../pages/banners/mock-data";
import { API_URL } from "../constants/app";
import { getAuthHeaders, refreshToken, isTokenExpired, getToken } from "../utils/auth";

/**
 * ======================
 * 小工具 & 统一错误处理
 * ======================
 */

// 构建查询字符串（忽略 null/undefined）
const buildQueryString = (params: Record<string, string | number | boolean | undefined | null>): string => {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null) {
      searchParams.append(key, String(value));
    }
  });
  return searchParams.toString();
};

// 统一把 HTTP 错误转成可读 Error
const toHttpError = async (res: Response): Promise<Error> => {
  let msg = `HTTP error! status: ${res.status}`;
  try {
    const j = await res.clone().json();
    msg = j?.error?.message || j?.message || msg;
  } catch {
    // 可能无 body 或非 JSON
    try {
      const t = await res.clone().text();
      if (t) msg = `${msg} - ${t}`;
    } catch { }
  }
  return new Error(msg);
};

// 是否正在刷新 token（防止并发刷新）
let isRefreshing = false;
// 等待刷新完成的 Promise 队列
let refreshPromise: Promise<boolean> | null = null;

/**
 * 跳转到登录页的辅助函数
 */
const redirectToLogin = () => {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("auth_user");
  if (typeof window !== "undefined") {
    window.location.href = "/login";
  }
};

/**
 * 确保响应成功，如果失败则抛出错误
 * 如果是认证相关错误（401、403），跳转到登录页
 * @returns 如果重试成功，返回新的响应对象；否则抛出错误
 */
const ensureOk = async (res: Response, retryRequest?: () => Promise<Response>): Promise<Response> => {
  if (res.ok) return res;
  
  // 如果是 401 错误，尝试刷新 token
  if (res.status === 401) {
    const token = getToken();
    
    if (token) {
      // Token 存在，尝试刷新
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = refreshToken();
      }
      
      const refreshed = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;
      
      if (refreshed && retryRequest) {
        // 刷新成功，重试原请求（使用新的 token）
        const retryRes = await retryRequest();
        if (retryRes.ok) {
          return retryRes; // 返回新的响应
        }
        // 重试仍然失败，跳转登录
        redirectToLogin();
        throw new Error("Token 已过期，请重新登录");
      } else {
        // 刷新失败，跳转登录
        redirectToLogin();
        throw new Error("Token 已过期，请重新登录");
      }
    } else {
      // 没有 token，直接跳转登录
      redirectToLogin();
      throw new Error("未登录，请先登录");
    }
  }
  
  // 403 禁止访问，跳转登录
  if (res.status === 403) {
    redirectToLogin();
    throw new Error("无权限访问，请重新登录");
  }
  
  // 非认证错误（含 500）统一抛出，不自动跳登录，便于前端展示真实错误
  throw await toHttpError(res);
};

const safeJson = async <T = any>(res: Response): Promise<T> => {
  try {
    return (await res.json()) as T;
  } catch {
    return {} as T;
  }
};

// 兼容不同后端常见返回结构，把列表与 total 抽出来
const extractListAndTotal = (payload: any): { list: any[]; total: number } => {
  const resolveArray = (obj: any): any[] => {
    if (Array.isArray(obj)) return obj;
    if (!obj || typeof obj !== "object") return [];
    const candidates = ["data", "items", "list", "records", "rows", "result"];
    for (const k of candidates) {
      if (Array.isArray(obj[k])) return obj[k];
    }
    return [];
  };

  const resolveTotal = (obj: any): number => {
    if (!obj || typeof obj !== "object") return 0;
    if (typeof obj.total === "number") return obj.total;
    if (obj.data && typeof obj.data.total === "number") return obj.data.total;
    if (obj.meta && typeof obj.meta.total === "number") return obj.meta.total;
    return 0;
  };

  // 先看 payload.data，再看 payload 本身
  const inner = payload?.data ?? payload;
  const list = resolveArray(inner);
  const total = resolveTotal(payload) || resolveTotal(inner);
  return { list, total };
};

// 兼容单个对象的通用提取（支持 {data:{...}} / {...}）
const extractDataObject = (payload: any) => (payload?.data ?? payload);

// 资源名与新接口路径映射（保留页面 resource 命名，底层切到新 API）
const RESOURCE_ENDPOINT_MAP: Record<string, string> = {
  "product-types": "types",
  "store-addresses": "addresses",
  "users": "admin/users",
  "order-returns": "orders/returns",
};

const toEndpoint = (resource: string): string => RESOURCE_ENDPOINT_MAP[resource] ?? resource;

/**
 * ======================
 * DataProvider
 * ======================
 */

export const customDataProvider: DataProvider = {
  getList: async ({ resource, pagination, filters, sorters }) => {
    try {
      // 开发环境才输出调试信息
      if (import.meta.env.DEV) {
        console.log('getList', resource, pagination, filters, sorters);
      }
      const endpoint = toEndpoint(resource);
      const url = `${API_URL}/${endpoint}`;
      const current = pagination?.currentPage ?? 1; // refine: 1-based
      const pageSize = pagination?.pageSize ?? 10;

      const query: Record<string, string> = {
        page: String(current),
        pageSize: String(pageSize),
      };

      // 排序（示例：取第一个；如果后端支持多字段，可循环拼接）
      if (Array.isArray(sorters) && sorters.length > 0) {
        const { field, order } = sorters[0];
        if (field) query.sort = String(field);
        if (order) query.order = order === "desc" ? "desc" : "asc";
      }

      // 过滤（等值），复杂操作请按后端规范扩展
      if (Array.isArray(filters)) {
        filters.forEach((f) => {
          if (f.operator === "eq" && f.value !== undefined && f.field) {
            query[String(f.field)] = String(f.value);
          }
          // 支持模糊搜索（contains操作符），后端接口直接使用字段名作为参数
          if (f.operator === "contains" && f.value !== undefined && f.field && f.value !== "") {
            query[String(f.field)] = String(f.value);
          }
          // 支持时间范围筛选
          if ((f.operator === "gte" || f.operator === "lte") && f.value !== undefined && f.field && f.value !== "") {
            query[String(f.field)] = String(f.value);
          }
          // 支持 in 操作符（用于筛选多个值）
          if (f.operator === "in" && Array.isArray(f.value) && f.value.length > 0 && f.field) {
            query[`${String(f.field)}In`] = f.value.join(",");
          }
        });
      }

      const qs = buildQueryString(query);
      const res = await fetch(`${url}?${qs}`, { headers: getAuthHeaders(false) });
      const finalRes = await ensureOk(res, () => fetch(`${url}?${qs}`, { headers: getAuthHeaders(false) }));

      const payload = await safeJson(finalRes);
      const { list, total } = extractListAndTotal(payload);

      return { data: list, total };
    } catch (error) {
      if (import.meta.env.DEV) {
        console.warn(`getList(${resource}) failed, fallback if applicable:`, error);
      }

      // 如果是认证错误，已经跳转到登录页，不需要处理
      if (error instanceof Error && (
        error.message.includes("登录") || 
        error.message.includes("Token")
      )) {
        throw error; // 重新抛出，让上层处理
      }

      // 对 banners 做本地 mock 回退
      if (resource === "banners") {
        const current = (pagination as any)?.current ?? 1;
        const pageSize = pagination?.pageSize ?? 10;
        const start = (current - 1) * pageSize;
        const end = start + pageSize;
        return {
          data: mockBanners.slice(start, end),
          total: mockBanners.length,
        };
        // 其他资源：返回空
      }
      return { data: [], total: 0 };
    }
  },

  getOne: async ({ resource, id }) => {
    try {
      const endpoint = toEndpoint(resource);
      const url = `${API_URL}/${endpoint}/${id}`;
      const res = await fetch(url, { headers: getAuthHeaders(false) });
      const finalRes = await ensureOk(res, () => fetch(url, { headers: getAuthHeaders(false) }));
      const payload = await safeJson(finalRes);
      return { data: extractDataObject(payload) };
    } catch (error) {
      // 如果是认证错误，已经跳转到登录页，重新抛出
      if (error instanceof Error && (
        error.message.includes("登录") || 
        error.message.includes("Token")
      )) {
        throw error;
      }
      throw error;
    }
  },

  create: async ({ resource, variables }) => {
    const endpoint = toEndpoint(resource);
    const url = `${API_URL}/${endpoint}`;
    const res = await fetch(url, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(variables),
    });
    const finalRes = await ensureOk(res, () => fetch(url, {
      method: "POST",
      headers: getAuthHeaders(true),
      body: JSON.stringify(variables),
    }));
    const payload = await safeJson(finalRes);
    return { data: extractDataObject(payload) };
  },

  update: async ({ resource, id, variables }) => {
    try {
      // 开发环境才输出调试信息
      if (import.meta.env.DEV) {
        console.log('customDataProvider.update 被调用:', { resource, id, variables });
      }
      
      const endpoint = toEndpoint(resource);
      // 退货审核接口是 /orders/returns/:id/audit，不走通用 /:id 更新
      const url =
        resource === "order-returns"
          ? `${API_URL}/${endpoint}/${id}/audit`
          : `${API_URL}/${endpoint}/${id}`;
      
      const res = await fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(variables),
      });
      
      const finalRes = await ensureOk(res, () => fetch(url, {
        method: "PUT",
        headers: getAuthHeaders(true),
        body: JSON.stringify(variables),
      }));
      const payload = await safeJson(finalRes);
      return { data: extractDataObject(payload) };
    } catch (error) {
      // 如果是认证错误，已经跳转到登录页，重新抛出
      if (error instanceof Error && (
        error.message.includes("登录") || 
        error.message.includes("Token")
      )) {
        throw error;
      }
      throw error;
    }
  },

  deleteOne: async ({ resource, id }) => {
    const endpoint = toEndpoint(resource);
    const url = `${API_URL}/${endpoint}/${id}`;
    const res = await fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    });
    await ensureOk(res, () => fetch(url, {
      method: "DELETE",
      headers: getAuthHeaders(false),
    }));
    // 返回已删除 id
    return { data: { id } as any };
  },

  getMany: async ({ resource, ids }) => {
    const endpoint = toEndpoint(resource);
    const results = await Promise.all(
      ids.map(async (id) => {
        const url = `${API_URL}/${endpoint}/${id}`;
        const res = await fetch(url, { headers: getAuthHeaders(false) });
        const finalRes = await ensureOk(res, () => fetch(url, { headers: getAuthHeaders(false) }));
        const payload = await safeJson(finalRes);
        return extractDataObject(payload);
      })
    );
    return { data: results };
  },

  updateMany: async ({ resource, ids, variables }) => {
    const endpoint = toEndpoint(resource);
    await Promise.all(
      ids.map(async (id) => {
        const url = `${API_URL}/${endpoint}/${id}`;
        const res = await fetch(url, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify(variables),
        });
        await ensureOk(res, () => fetch(url, {
          method: "PUT",
          headers: getAuthHeaders(true),
          body: JSON.stringify(variables),
        }));
      })
    );
    // 多数场景前端只需 ids 即可刷新
    return { data: ids as any };
  },

  deleteMany: async ({ resource, ids }) => {
    const endpoint = toEndpoint(resource);
    await Promise.all(
      ids.map(async (id) => {
        const url = `${API_URL}/${endpoint}/${id}`;
        const res = await fetch(url, {
          method: "DELETE",
          headers: getAuthHeaders(false),
        });
        await ensureOk(res, () => fetch(url, {
          method: "DELETE",
          headers: getAuthHeaders(false),
        }));
      })
    );
    // refine 允许返回 ids 或 {id} 数组，这里返回 ids
    return { data: ids as any };
  },

  custom: async ({ url, method, payload, query, headers }) => {
    let requestUrl = `${url}`;
    if (query) {
      const qs = buildQueryString(query);
      requestUrl = `${requestUrl}?${qs}`;
    }

    const isGetLike = !method || method.toUpperCase() === "GET";
    const res = await fetch(requestUrl, {
      method: method || "GET",
      headers: {
        ...getAuthHeaders(!isGetLike), // GET/DELETE 不强加 Content-Type
        ...(headers || {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
    });

    const finalRes = await ensureOk(res, () => fetch(requestUrl, {
      method: method || "GET",
      headers: {
        ...getAuthHeaders(!isGetLike),
        ...(headers || {}),
      },
      body: payload ? JSON.stringify(payload) : undefined,
    }));
    const data = await safeJson(finalRes);
    return { data };
  },

  getApiUrl: () => API_URL,
};
