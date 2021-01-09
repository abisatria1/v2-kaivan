const Op = require("sequelize").Op
// models
const Order = require("../models/Order")
const Customer = require("../models/Customer")
const Driver = require("../models/Driver")
const Partner = require("../models/Partner")
const Payment = require("../models/Payment")
const Contact = require("../models/Contact")

const getAllOrderByDate = async (tanggalAwal, tanggalAkhir) => {
  const order = await Order.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "deletedAt",
        "customerId",
        "paymentId",
        "partnerId",
        "driverId",
      ],
    },
    include: [
      {
        model: Customer,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Driver,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        through: {
          attributes: [],
        },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Partner,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Payment,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
    ],
    where: {
      [Op.and]: [
        { tanggalOrder: { [Op.gte]: `${tanggalAwal} 00:00:00` } },
        { tanggalOrder: { [Op.lte]: `${tanggalAkhir} 23:59:59` } },
      ],
    },
    order: [
      ["status", "ASC"],
      ["jam", "ASC"],
    ],
  })

  return order
}

const addOrder = async (contact, orderRequestData) => {
  const { order, driverId, partnerId } = orderRequestData
  const { tanggalOrder, jumlah, jam, status, keterangan, harga } = order
  console.log(order)

  // add order with customer
  const createOrder = await Order.create(
    {
      tanggalOrder,
      jumlah,
      jam,
      status,
      keterangan,
      harga,
      partnerId: partnerId == -1 ? null : partnerId,
      customer: {
        contactGoogleId: contact.googleId,
      },
    },
    {
      include: [Customer],
    }
  )

  // cek driver apakah kosong atau tidak
  if (driverId.length) {
    await createOrder.setDrivers(driverId)
  }

  const result = await getDetailOrder(createOrder.id)
  return result
}

const updateOrder = async (prevOrder, newOrder) => {
  const { order, driverId, partnerId } = newOrder

  await prevOrder.update({
    ...order,
    partnerId: partnerId == -1 ? null : partnerId,
  })
  await prevOrder.setDrivers(driverId)

  const result = await getDetailOrder(prevOrder.id)
  return result
}

const deleteOrder = async (order) => {
  await order.destroy()
  return {}
}

const getDetailOrder = async (orderId = 0) => {
  const order = await Order.findOne({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "deletedAt",
        "customerId",
        "paymentId",
        "partnerId",
        "driverId",
      ],
    },
    include: [
      {
        model: Customer,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Driver,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        through: {
          attributes: [],
        },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Partner,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Payment,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
      },
    ],
    where: {
      id: orderId,
    },
  })
  return order
}

const findOrderById = async (orderId = 0) => {
  return await Order.findByPk(orderId)
}

// Menampilkan order yang blm di cek sesuai dengan kode driver / id
// tanpa order dengan status proses
// bisa menggunakan all dan custom tanggal
const getNotCheckedOrderByDriver = async (
  driverCode,
  tanggalAwal,
  tanggalAkhir
) => {
  let tanggalAwalQuery = [],
    tanggalAkhirQuery = []
  if (tanggalAwal && tanggalAwal != "") {
    tanggalAwalQuery = [
      { tanggalOrder: { [Op.gte]: `${tanggalAwal} 00:00:00` } },
    ]
  }
  if (tanggalAkhir && tanggalAkhir != "") {
    tanggalAkhirQuery = [
      { tanggalOrder: { [Op.lte]: `${tanggalAkhir} 23:59:59` } },
    ]
  }

  const driverOrder = await Order.findAll({
    attributes: {
      exclude: [
        "createdAt",
        "updatedAt",
        "deletedAt",
        "customerId",
        "paymentId",
        "partnerId",
      ],
    },
    include: [
      {
        model: Customer,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Partner,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        include: [
          {
            model: Contact,
            attributes: {
              exclude: ["createdAt", "updatedAt", "deletedAt", "raw"],
            },
          },
        ],
      },
      {
        model: Driver,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
        through: {
          attributes: [],
        },
        where: { kodeSopir: driverCode },
      },
    ],
    where: {
      [Op.and]: [
        ...tanggalAwalQuery,
        ...tanggalAkhirQuery,
        { status: { [Op.not]: 1 } }, // proses
        { isCheck: 0 }, // blm di cek
      ],
    },
    order: [
      ["tanggalOrder", "asc"],
      ["jam", "ASC"],
    ],
  })

  return driverOrder
}

// mengubah kondisi order dari belum di cek menjadi sudah di cek
const checkDriverOrder = async (driverCode, orderIds = []) => {
  let updated = 0
  const order = await Order.findAll({
    include: [
      {
        model: Driver,
        where: { kodeSopir: driverCode },
      },
    ],
    where: {
      id: { [Op.in]: orderIds },
    },
  })
  for (let i = 0; i < order.length; i++) {
    const element = order[i]
    await element.update({ isCheck: 1 })
    updated++
  }
  return {
    requestToUpdate: orderIds.length,
    updated,
  }
}

module.exports = {
  getAllOrderByDate,
  addOrder,
  updateOrder,
  deleteOrder,
  getDetailOrder,
  findOrderById,
  getNotCheckedOrderByDriver,
  checkDriverOrder,
}
