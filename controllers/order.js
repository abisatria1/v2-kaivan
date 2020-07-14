const {response,customError} = require('../helpers/wrapper')
const Op = require('sequelize').Op
 // models
const Order = require('../models/Order')
const Customer = require('../models/Customer')
const Driver = require('../models/Driver')
const Partner = require('../models/Partner')
const Payment = require('../models/Payment')
const Contact = require('../models/Contact')

const getDetailOrder = async (orderId = 0) => {
    const order = await Order.findOne({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt','customerId','paymentId','partnerId','driverId']},
        include : [
            {
                model : Customer,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
            },
            {
                model : Driver,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                through : {
                    attributes : []
                },
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
            },
            {
                model : Partner,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
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
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
            },
            {
                model : Driver,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                through : {
                    attributes : []
                },
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
            },
            {
                model : Partner,
                attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
                include : [{
                    model : Contact,
                    attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
                }]
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
        },
        order : [
            ['status', 'ASC'],
            ['jam', 'ASC']
        ]
    })
    response(res,true,order,'Semua data order berhasil didapatkan',200)
}

const addOrder = async (req,res,next) => {
    const {contact} = req
    const {order,driverId,partnerId} = req.body
    const {tanggalOrder,jumlah,jam,status,keterangan,harga} = order
    
    // add order with customer
    const createOrder = await Order.create({
        tanggalOrder,jumlah,jam,status,keterangan,harga,
        partnerId : partnerId == -1 ? null : partnerId,
        customer : {
            contactGoogleId : contact.resourceName
        }
    },{
        include : [Customer]
    })

    // cek driver apakah kosong atau tidak
    if (driverId.length) {
        await createOrder.setDrivers(driverId)
    }

    const result = await getDetailOrder(createOrder.id)
    response(res,true,result,'Order berhasil ditambahkan',201)
}

const updateOrder = async (req,res,next) => {
    // update order
    let {order,driverId,partnerId} = req.body
    // settign partner id
    order.partnerId = partnerId == -1 ? null : partnerId
    const orderInstance = await Order.findByPk(req.params.orderId)
    const update = await orderInstance.update(order)
    // update driver
    await orderInstance.setDrivers(driverId)
    const result = await getDetailOrder(orderInstance.id)
    response(res,true,result,'Order berhasil diubah',200)
}

const deleteOrder = async (req,res,next) => {
    const order=  await Order.findByPk(req.params.orderId)
    if (!order) return next(customError('Order tidak ditemukan',400))
    const destroy = await order.destroy()
    return response(res,true,{},'Data berhasil dihapus',200)
}


module.exports = {
    getAllOrderByDate,
    addOrder,
    updateOrder,
    deleteOrder
}