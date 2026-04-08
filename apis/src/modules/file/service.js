const path = require('path')
const qiniu = require('qiniu')
const { QiniuConf } = require('../../../conf/qiniu')

const zoneMap = {
    z0: qiniu.zone.Zone_z0,
    z1: qiniu.zone.Zone_z1,
    z2: qiniu.zone.Zone_z2,
    na0: qiniu.zone.Zone_na0,
    as0: qiniu.zone.Zone_as0,
}

function getUploadToken() {
    const { accessKey, secretKey, bucket } = QiniuConf
    const mac = new qiniu.auth.digest.Mac(accessKey, secretKey)
    const putPolicy = new qiniu.rs.PutPolicy({ scope: bucket })
    return putPolicy.uploadToken(mac)
}

function buildUrl(key) {
    if (!QiniuConf.domain) return key
    return `${QiniuConf.domain.replace(/\/+$/, '')}/${key}`
}

function uploadToQiniu(localPath, filename) {
    const config = new qiniu.conf.Config()
    config.zone = zoneMap[QiniuConf.zone] || qiniu.zone.Zone_z2
    const formUploader = new qiniu.form_up.FormUploader(config)
    const putExtra = new qiniu.form_up.PutExtra()
    const ext = path.extname(filename || '')
    const key = `${Date.now()}_${Math.random().toString(36).slice(2, 8)}${ext}`
    const token = getUploadToken()

    return new Promise((resolve, reject) => {
        formUploader.putFile(token, key, localPath, putExtra, (err, body, info) => {
            if (err) return reject(err)
            if (info.statusCode !== 200) return reject(new Error(`qiniu status ${info.statusCode}`))
            resolve({ key, url: buildUrl(key), raw: body })
        })
    })
}

module.exports = {
    uploadToQiniu,
}
