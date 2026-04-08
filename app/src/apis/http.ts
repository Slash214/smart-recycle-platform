// src/utils/request.ts
import { BASE_URL } from '@/constant/index';
import { TOKEN_KEY } from '@/constant'
import { getStorage } from '@/utils/StorageUtils'
import type { RequestOptions, RequestError, ApiResponse } from '@/models/index'


/**
 * 拼接 GET 请求的 query 参数 (可选, 看你是否需要这种形式)
 */
function buildQueryString(params: Record<string, any>): string {
	if (!params) return '';

	const queryArray = Object.keys(params).map((key) => {
		const val = params[key];
		// 如果值是对象或数组，就 stringify
		if (val && typeof val === 'object') {
			return `${encodeURIComponent(key)}=${encodeURIComponent(JSON.stringify(val))}`;
		} else {
			return `${encodeURIComponent(key)}=${encodeURIComponent(val)}`;
		}
	});

	const query = queryArray.join('&');
	return query ? `?${query}` : '';
}

export async function baseRequest<R = any>(options: RequestOptions): Promise<R> {
	const { url, method = 'GET', data, params, headers = { 'Content-Type': 'application/json' } } = options;

	// 请求前：添加 token（如果存在）
	const token = getStorage<string>(TOKEN_KEY) ?? ''
	if (token) {
		headers.Authorization = `Bearer ${token}`
	}

	// 构造请求地址及数据
	let requestUrl = `${BASE_URL}${url}`;
	let requestData = data;
	if (method === 'GET' && params) {
		requestUrl += buildQueryString(params);
		requestData = undefined;
	}

	try {
		const response = await new Promise<UniApp.RequestSuccessCallbackResult>((resolve, reject) => {
			uni.request({
				url: requestUrl,
				method,
				data: requestData,
				header: headers,
				success: resolve,
				fail: reject,
			});
		});

		if (response.statusCode !== 200) {
			throw { statusCode: response.statusCode, data: response.data, headers: response.header, errMsg: `HTTP Error: ${response.statusCode}` } as RequestError;
		}

		const result = response.data as ApiResponse<R>;
		if (typeof result.code === 'number') {
			if (result.code !== 200) {
				uni.showToast({ title: result.message || '请求失败', icon: 'none' });
				throw { statusCode: 200, data: result, errMsg: result.message || '业务错误' } as RequestError;
			}
			return result.data;
		}
		return response.data as R;
	} catch (error: any) {
		// 捕获网络或其他错误
		if (error.statusCode) {
			throw error;
		}
		throw { errMsg: error.errMsg || 'Network Error' } as RequestError;
	}
}

// 快捷方法
export const get = <R = any>(url: string, params?: Record<string, any>, options?: Omit<RequestOptions, 'url' | 'method' | 'params'>) =>
	baseRequest<R>({ ...options, url, method: 'GET', params });

export const post = <R = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) =>
	baseRequest<R>({ ...options, url, method: 'POST', data });

export const put = <R = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) =>
	baseRequest<R>({ ...options, url, method: 'PUT', data });

export const del = <R = any>(url: string, data?: any, options?: Omit<RequestOptions, 'url' | 'method' | 'data'>) =>
	baseRequest<R>({ ...options, url, method: 'DELETE', data });

export default {
	baseRequest,
	get,
	post,
	put,
	del,
};
