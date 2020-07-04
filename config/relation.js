const Customer = require('../models/Customer')
const Order = require('../models/Order')
const Driver = require('../models/Driver')
const Partner = require('../models/Partner')
const Payment = require('../models/Payment')
const Secret = require('../models/Secret')
const GoogleToken = require('../models/GoogleToken')

Customer.hasMany(Order)
Order.belongsTo(Customer)

Driver.belongsToMany(Order, {through : 'order_driver'})
Order.belongsToMany(Driver, {through : 'order_driver'})

Partner.hasMany(Order)
Order.belongsTo(Partner)

Partner.hasMany(Payment)
Payment.belongsTo(Partner)

Payment.hasMany(Order)
Order.belongsTo(Payment)