import type { Order } from '@/models'
import { get, post, put, del } from './http'
import { BASE_URL, TOKEN_KEY } from '@/constant'
import { getStorage } from '@/utils/StorageUtils'


export const getCarouseList = () => {
	return get('/carousel')
}

export const getAddressList = () => {
	return get('/address')
}


export interface MiniOrderDeviceLine {
	model: string
	memory: string
	unit: 'whole' | 'board'
	qty: number
}

export interface MiniOrderPayload {
	nums: number
	phone: string
	type: 1 | 2
	way: 1 | 2 | 3
	payee_name?: string
	wechat_account?: string
	alipay_account?: string
	bank_name?: string
	bank_card_no?: string
	tracking_number?: string
	express_company?: string
	remark?: string
	/** 回收明细（与 nums 一致时由服务端落库 order_devices） */
	devices?: MiniOrderDeviceLine[]
	remark_images?: string[]
	status?: 10 | 20 | 30 | 40 | 50 | 60
}

export const createOrder = (data: MiniOrderPayload) => {
	const normalizedPayload: MiniOrderPayload = {
		...data,
		nums: Number(data.nums) as number,
		type: Number(data.type) as 1 | 2,
		way: Number(data.way) as 1 | 2 | 3,
		status: data.status === undefined ? undefined : (Number(data.status) as 10 | 20 | 30 | 40 | 50 | 60),
		devices: Array.isArray(data.devices) ? data.devices : undefined,
		remark_images: Array.isArray(data.remark_images)
			? data.remark_images.map((item) => String(item)).filter((item) => !!item)
			: [],
	}
	return post('/v1/orders', normalizedPayload, {
		headers: {
			'Content-Type': 'application/json',
		},
	})
}

export const getOrderList = (params: {
	page: number
	pageSize: number
	status?: 10 | 20 | 30 | 40 | 50 | 60
	keyword?: string
}) => {
	return get<{ list?: any[]; data?: any[]; total?: number }>('/v1/orders', params)
}

export const getOrderDetail = (id: number) => {
	return get(`/v1/orders/${id}`)
}

export const updateOrder = (id: number, data: Partial<MiniOrderPayload>) => {
	return put(`/v1/orders/${id}`, data)
}

export const uploadImageFile = async (filePath: string) => {
	const token = getStorage<string>(TOKEN_KEY)
	if (!token) {
		throw new Error('未获取到登录凭证')
	}

	const uploadRes = await new Promise<UniApp.UploadFileSuccessCallbackResult>((resolve, reject) => {
		uni.uploadFile({
			url: `${BASE_URL}/v1/files/images`,
			filePath,
			name: 'file',
			header: {
				Authorization: `Bearer ${token}`,
			},
			success: resolve,
			fail: reject,
		})
	})

	if (uploadRes.statusCode !== 200) {
		throw new Error(`上传失败(${uploadRes.statusCode})`)
	}

	let parsed: {
		code: number
		message?: string
		data?: { key: string; url: string; raw?: any }
	}
	try {
		parsed = JSON.parse(uploadRes.data || '{}')
	} catch (error) {
		throw new Error('上传失败：服务返回格式异常')
	}

	if (parsed.code !== 200 || !parsed.data?.url) {
		throw new Error(parsed.message || '图片上传失败')
	}

	return parsed.data
}


export const createUser = (data: any) => {
	return post(`/user/`, data)
}

interface SilentLoginResponse {
	token: string
	user: {
		id: number
		openid: string
		userName?: string
		username?: string
		avatar?: string
		mobile?: string
		platform?: string
	}
}

interface BannerItem {
	id: number
	image_url?: string
	imageUrl?: string
	imgUrl?: string
	[key: string]: any
}

interface TypeBrandCategory {
	id: number
	typeName: string
	orderNo?: number
	brands: Array<{
		id: number
		brand?: string
		logo?: string
		ptypeId?: number
		orderNum?: number
		updateinfo?: number
		[key: string]: any
	}>
	[key: string]: any
}

interface MiniTypeBrandsResponse {
	selectedPtypeId: number
	categories: TypeBrandCategory[]
}

export const silentLogin = (data: { code: string }) => {
	return post<SilentLoginResponse>('/v1/mini/auth/silent-login', data)
}

export const getMiniBanners = (params: { page: number; pageSize: number }) => {
	return get<BannerItem[]>('/v1/mini/banners', params)
}

interface MiniDefaultAddress {
	id: number
	user: string
	wechat?: string
	address?: string
	fullAddress?: string
	img?: string
	latitude?: number
	longitude?: number
	busin?: string
	mobile?: string
	status?: number
	defaultAddress?: number
	createdAt?: string
	updatedAt?: string
}

export const getMiniDefaultAddress = () => {
	return get<MiniDefaultAddress | null>('/v1/mini/default-address')
}

export const getMiniTypeBrands = (params?: { ptypeId?: number }) => {
	return get<MiniTypeBrandsResponse>('/v1/mini/type-brands', params)
}

export const getMiniPolicy = (type: 'agreement' | 'privacy') => {
	return get<{ type: string; title: string; content: string; updatedAt?: string | null }>('/v1/mini/policy', { type })
}

export const getMiniSiteConfig = () => {
	return get<{ servicePhone: string; contactWechat: string; updatedAt?: string | null }>('/v1/mini/site-config')
}

export const updateUser = (id: number, data: any) => {
	return put(`/user/${id}`, data)
}


export const getProductList = () => {
	return get('/phone')
}


// 获取详情的
export const getTableImage = (id: number) => {
	return get(`/details-image/${id}`)
}

export const getBrandImages = (id: number) => {
	return get<{ brandId: number; imageUrls: string[] }>(`/v1/mini/brands/${id}/images`)
}

// 获取手机号
export const getTel = (data: { code: string }) => {
	return post('/get-tel', data)
}