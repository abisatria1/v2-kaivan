const {response,customError} = require('../helpers/wrapper')
const Op = require('sequelize').Op
 // models
const Order = require('../models/Order')
const Customer = require('../models/Customer')
const Driver = require('../models/Driver')
const Partner = require('../models/Partner')
const Payment = require('../models/Payment')

const getDetailOrder = async (orderId) => {
    const order = await Order.findOne({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt','customerId','paymentId','partnerId','driverId']},
        include : [
            {
                model : Customer,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            },
            {
                model : Driver,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                through : {
                    attributes : []
                }
            },
            {
                model : Partner,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            },
            {
                model : Payment,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            }
        ],
        where : {
            id : orderId
        }
    })
    return order
}

// format date YYYY-MM-DD
const getAllOrderByDate = async (req,res,next) => {
    let tanggalAwal = req.query.tanggalAwal || '1999-01-01'
    let tanggalAkhir = req.query.tanggalAkhir || tanggalAwal
    if (tanggalAwal== "" || tanggalAkhir == "") return next(customError('Query not valid',400))
    const order = await Order.findAll({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt','customerId','paymentId','partnerId','driverId']},
        include : [
            {
                model : Customer,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            },
            {
                model : Driver,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                through : {
                    attributes : []
                }
            },
            {
                model : Partner,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            },
            {
                model : Payment,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
            }
        ],
        where : {
            [Op.and] : [
                {tanggalOrder : {[Op.gte] : `${tanggalAwal} 00:00:00`}},
                {tanggalOrder : {[Op.lte] : `${tanggalAkhir} 23:59:59` }}
            ]
        }
    })
    response(res,true,order,'Semua data order berhasil didapatkan',200)
}

const addOrder = async (req,res,next) => {
    const {customer} = req
    console.log(customer)
    const {driverId,partnerId} = req.body
    req.body.order.customerId = customer.id
    if (partnerId != -1) req.body.order.partnerId = partnerId
    const order = await Order.create(req.body.order)
    if (driverId != -1) await order.addDriver(driverId)
    const result = await getDetailOrder(order.id)
    response(res,true,result,'Order berhasil ditambahkan',201)
}

const updateOrder = async (req,res,next) => {
    // 
}


module.exports = {
    getAllOrderByDate,
    addOrder
}