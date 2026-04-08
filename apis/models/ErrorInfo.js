/**
 * @description 失败码合集
 * @author 爱呵呵
 */

module.exports = {
	NoPage: {
		code: 404,
		message: '当前路由不存在'
	},
	ParamsError: {
		code: 50001,
		message: '请求的参数不正确'
	},
	uploadFileSizeFailInfo: {
		code: 50002,
		message: '上传的图片尺寸大于10MB'
	}

}