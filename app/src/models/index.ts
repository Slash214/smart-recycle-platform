
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'HEAD' | 'OPTIONS';


export interface RequestOptions<T = any> {
	url: string;
	method?: HttpMethod;
	data?: T;
	params?: Record<string, any>;
	headers?: Record<string, string>;
}

export interface RequestError {
	statusCode?: number;
	data?: any;
	headers?: Record<string, string>;
	errMsg: string;
}

export interface ApiResponse<R = any> {
	code: number;
	message: string;
	data: R;
}


export interface Order {
	userId: number,
	quantity: number,
	price: string,
	shippingMethod: string
	courier: string,
	senderPhone: string,
	trackingNumber: string
	id?: number
}

export interface AddressItem {
	id: number,
	contactName: string,
	addressName: string,
	phone: string,
}