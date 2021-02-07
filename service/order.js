const Op = require("sequelize").Op
const db = require("../config/database")
// models
const Order = require("../models/Order")
const Customer = require("../models/Customer")
const Driver = require("../models/Driver")
const Partner = require("../models/Partner")
const Payment = require("../models/Payment")
const Contact = require("../models/Contact")
// helper
const { dateBeetweenQuery } = require("../helpers/date")

const getAllOrderByDate = async (tanggalAwal, tanggalAkhir) => {
  const { tanggalAwalQuery, tanggalAkhirQuery } = dateBeetweenQuery(
    tanggalAwal,
    tanggalAkhir
  )
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
      [Op.and]: [...tanggalAwalQuery, ...tanggalAkhirQuery],
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
// tanpa order dengan status = "proses"
// bisa menggunakan all dan custom tanggal
// allowed option = belum,sudah,semua dan sudah divalidasi
const getDriverOrderByOption = async (
  driverCode,
  tanggalAwal,
  tanggalAkhir,
  tipeOrder
) => {
  const { tanggalAwalQuery, tanggalAkhirQuery } = dateBeetweenQuery(
    tanggalAwal,
    tanggalAkhir
  )

  let isCheckQuery = []
  switch (tipeOrder) {
    case "belum":
      isCheckQuery.push({ isCheck: 0 })
      break
    case "sudah":
      isCheckQuery.push({ isCheck: 1 })
      break
    default:
      break
  }

  let driverOrder = await Order.findAll({
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
      },
    ],
    where: {
      [Op.and]: [
        ...tanggalAwalQuery,
        ...tanggalAkhirQuery,
        ...isCheckQuery,
        { status: { [Op.not]: 1 } }, // proses // blm di cek
      ],
    },
    order: [
      ["tanggalOrder", "asc"],
      ["jam", "ASC"],
    ],
  })

  const filteredArr = driverOrder.filter((item) => {
    const hasilCari = item.drivers.find(
      (driver) => driver.kodeSopir == driverCode
    )
    return hasilCari != undefined
  })

  return filteredArr
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

// Menampilkan order yang blm di bayar sesuai dengan kode partnerid
// tanpa order dengan status = "proses"
// bisa menggunakan all dan custom tanggal
const getNotPayPartnerOrder = async (partnerId, tanggalAwal, tanggalAkhir) => {
  const { tanggalAwalQuery, tanggalAkhirQuery } = dateBeetweenQuery(
    tanggalAwal,
    tanggalAkhir
  )

  const order = await Order.findAll({
    attributes: {
      exclude: ["createdAt", "updatedAt", "deletedAt", "customerId"],
    },
    include: [
      {
        model: Customer,
        attributes: {
          exclude: ["contactGoogleId", "createdAt", "updatedAt", "deletedAt"],
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
        model: Driver,
        attributes: {
          exclude: ["contactGoogleId", "createdAt", "updatedAt", "deletedAt"],
        },
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
    ],
    where: {
      [Op.and]: [
        ...tanggalAwalQuery,
        ...tanggalAkhirQuery,
        { isPay: 0 },
        { partnerId },
        { status: { [Op.not]: 1 } }, // status = proses
      ],
    },
    order: [
      ["tanggalOrder", "asc"],
      ["jam", "ASC"],
    ],
  })

  return order
}

// mengecek order apakah id jasa sesuai dan isPay=0
const getPartnerNotPayOrderByOrderIds = async ({
  orderIds = [],
  partnerId = 0,
  tanggalAwal = "",
  tanggalAkhir = "",
}) => {
  const { tanggalAwalQuery, tanggalAkhirQuery } = dateBeetweenQuery(
    tanggalAwal,
    tanggalAkhir
  )
  const order = await Order.findAll({
    where: {
      [Op.and]: [
        { id: { [Op.in]: orderIds } },
        { isPay: 0 },
        { partnerId: partnerId },
        ...tanggalAwalQuery,
        ...tanggalAkhirQuery,
      ],
    },
  })

  return order
}

const payingPartnerOrder = async ({
  order = [],
  orderIds = [],
  partnerId = 0,
  tanggalAwal = "",
  tanggalAkhir = "",
}) => {
  let totalOrder = 0,
    totalBayar = 0

  const { tanggalAwalQuery, tanggalAkhirQuery } = dateBeetweenQuery(
    tanggalAwal,
    tanggalAkhir
  )

  // hitung total order dan komisi
  order.forEach((item) => {
    let bayar = 0
    if (item.harga > 500000) bayar = 100000
    else bayar = item.harga * 0.2
    totalOrder++
    totalBayar += bayar * item.jumlah
  })

  const payment = await Payment.create({
    jumlahBayar: totalBayar,
    jumlahOrder: totalOrder,
    partnerId,
  })

  const update = await Order.update(
    {
      isPay: 1,
      paymentId: payment.id,
    },
    {
      where: {
        [Op.and]: [
          { id: { [Op.in]: orderIds } },
          { isPay: 0 },
          ...tanggalAwalQuery,
          ...tanggalAkhirQuery,
        ],
      },
    }
  )
  return update
}

module.exports = {
  getAllOrderByDate,
  addOrder,
  updateOrder,
  deleteOrder,
  getDetailOrder,
  findOrderById,
  getDriverOrderByOption,
  checkDriverOrder,
  getNotPayPartnerOrder,
  getPartnerNotPayOrderByOrderIds,
  payingPartnerOrder,
}
