const { response, customError } = require("../helpers/wrapper")
const orderService = require("../service/order")

// format date YYYY-MM-DD
const getAllOrderByDate = async (req, res, next) => {
  let tanggalAwal = req.query.tanggalAwal || "1999-01-01"
  let tanggalAkhir = req.query.tanggalAkhir || tanggalAwal
  if (tanggalAwal == "" || tanggalAkhir == "")
    return next(customError("Query not valid", 400))

  const order = await orderService.getAllOrderByDate(tanggalAwal, tanggalAkhir)
  response(res, true, order, "Semua data order berhasil didapatkan", 200)
}

const addOrder = async (req, res, next) => {
  const { contact } = req
  const result = await orderService.addOrder(contact, req.body)
  response(res, true, result, "Order berhasil ditambahkan", 201)
}

const updateOrder = async (req, res, next) => {
  const order = await orderService.findOrderById(req.params.orderId)
  if (!order) return next(customError("Order tidak ditemukan", 400))
  const result = await orderService.updateOrder(order, req.body)
  response(res, true, result, "Order berhasil diubah", 200)
}

const deleteOrder = async (req, res, next) => {
  const order = await orderService.findOrderById(req.params.orderId)
  if (!order) return next(customError("Order tidak ditemukan", 400))
  const result = await orderService.deleteOrder(order)
  return response(res, true, result, "Data berhasil dihapus", 200)
}

module.exports = {
  getAllOrderByDate,
  addOrder,
  updateOrder,
  deleteOrder,
}
