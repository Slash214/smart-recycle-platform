const seq = require('../seq')
const { INTEGER, BOOLEAN } = require('../type')

const UserBrandInteraction = seq.define('user_brand_interaction', {
    userId: {
        type: INTEGER,
        allowNull: false,
        comment: '用户ID',
    },
    brandId: {
        type: INTEGER,
        allowNull: false,
        comment: '品牌ID',
    },
    hasViewed: {
        type: BOOLEAN,
        defaultValue: false,
        comment: '用户是否查看过该产品',
    },
})

module.exports = UserBrandInteraction
