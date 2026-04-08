// src/utils/StorageUtils.ts

/**
 * 设置缓存数据
 * @param key 缓存的 key
 * @param value 要存储的数据
 */
export function setStorage(key: string, value: any): void {
	try {
		uni.setStorageSync(key, value);
	} catch (error) {
		console.error(`存储缓存失败，key: ${key}`, error);
	}
}

/**
 * 获取缓存数据
 * @param key 缓存的 key
 * @returns 缓存中的数据，如果获取失败则返回 null
 */
export function getStorage<T = any>(key: string): T | null {
	try {
		const value = uni.getStorageSync(key);
		return value === undefined ? null : value;
	} catch (error) {
		console.error(`获取缓存失败，key: ${key}`, error);
		return null;
	}
}

/**
 * 删除缓存数据
 * @param key 缓存的 key
 */
export function removeStorage(key: string): void {
	try {
		uni.removeStorageSync(key);
	} catch (error) {
		console.error(`删除缓存失败，key: ${key}`, error);
	}
}
