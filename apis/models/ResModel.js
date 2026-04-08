/**
 * @descrion 数据返回模型
 * @author 爱呵呵
 */

class BaseModel {
	constructor({ data, code, message, total, other }) {
		if (data) this.data = data
		if (message) this.message = message
		if (code) this.code = code
		if (total) this.total = total
		if (other) this.other = other
	}
}

class SuccessModel extends BaseModel {
	constructor({ data, total, message, other }) {
		super({
			code: 200,
			data,
			total,
			message,
			other
		})
	}
}

class ErrorModel extends BaseModel {
	constructor({ code, message }) {
		super({
			code,
			message
		})
	}
}

module.exports = {
	SuccessModel,
	ErrorModel
}