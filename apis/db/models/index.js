const Brand = require('./brand')
const Phone = require('./phone')
const User = require('./user')
const Order = require('./order')
const OrderDevice = require('./order_device')
const Address = require('./address')
const Banner = require('./banner')
const Details = require('./detailes')
const Help = require('./help')
const Admin = require('./admin')
const Config = require('./config')
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

Order.hasMany(OrderDevice, { foreignKey: 'order_id', as: 'devices', onDelete: 'CASCADE' })
OrderDevice.belongsTo(Order, { foreignKey: 'order_id' })

module.exports = {
    Brand,
    Phone,
    User,
    Order,
    OrderDevice,
    Address,
    Banner,
    Details,
    Ptype,
    Help,
    UserBrandInteraction,
    Admin,
    Config,
}
