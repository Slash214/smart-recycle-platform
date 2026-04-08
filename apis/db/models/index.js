const Brand = require('./brand')
const Phone = require('./phone')
const User = require('./user')
const Order = require('./order')
const Address = require('./address')
const Banner = require('./banner')
const Details = require('./detailes')
const Help = require('./help')
const Admin = require('./admin')
Phone.belongsTo(Brand, {
    foreignKey: 'brandId',
})


const Ptype = require('./Ptype')
const UserBrandInteraction = require('./UserBrandInteraction')

Brand.belongsTo(Ptype, {
    foreignKey: 'ptypeId',
    as: 'ptype',
})
Ptype.hasMany(Brand, {
    foreignKey: 'ptypeId',
    as: 'brands',
})

module.exports = {
    Brand,
    Phone,
    User,
    Order,
    Address,
    Banner,
    Details,
    Ptype,
    Help,
    UserBrandInteraction,
    Admin,
}
