const seq = require('../seq')
const { STRING, INTEGER } = require('../type')

const Banner = seq.define('banner', {
    imgUrl: {
        type: STRING,
        allowNull: false,
        comment: '图片url',
    },
    text: {
        type: STRING,
        comment: '标题内容',
    },
    link: {
        type: STRING,
        comment: '链接地址，可以为空',
    },
    status: {
        type: INTEGER,
        defaultValue: 1,
        comment: '状态 1 正常 0 关闭',
    },
})

module.exports = Banner
