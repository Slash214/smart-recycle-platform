function ok(data, message = 'ok', meta) {
    const payload = {
        code: 200,
        message,
        data: data === undefined ? null : data,
    }
    if (meta) payload.meta = meta
    return payload
}

function fail(code, message, details) {
    const payload = {
        code,
        message,
        data: null,
    }
    if (details) payload.details = details
    return payload
}

function toPaginationMeta(page, pageSize, total) {
    const pages = Math.ceil(total / pageSize)
    return {
        page,
        pageSize,
        total,
        pages,
    }
}

module.exports = {
    ok,
    fail,
    toPaginationMeta,
}
