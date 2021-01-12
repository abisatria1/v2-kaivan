const { response, customError } = require("../helpers/wrapper")
const partnerService = require("../service/partner")
const orderService = require("../service/order")

const getAllPartner = async (req, res, next) => {
  const partner = await partnerService.getAllPartner()
  return response(res, true, partner, "Data jasa berhasil didapatkan", 200)
}

const createPartner = async (req, res, next) => {
  const { contact } = req
  const partner = await partnerService.createPartner(contact, req.body)
  return response(res, true, partner, "Berhasil menambahkan data jasa", 200)
}

const getSpesificPartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  return response(res, true, partner, "Berhasil mendapatkan data jasa", 200)
}

const updatePartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  const update = await partnerService.updatePartner(partner, req.body)
  return response(res, true, update, "Data jasa berhasil diupdate", 200)
}

const deletePartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  const delPartner = await partnerService.deletePartner(partner)
  return response(res, true, delPartner, "Data jasa berhasil di hapus", 200)
}

const getAllNotPayOrder = async (req, res, next) => {
  const { partnerId } = req.params
  const { tanggalAwal = "", tanggalAkhir = "" } = req.query

  if (tanggalAwal != "" && isNaN(new Date(tanggalAwal).getTime())) {
    return next(customError("Invalid date", 400))
  }
  if (tanggalAkhir != "" && isNaN(new Date(tanggalAkhir).getTime())) {
    return next(customError("Invalid date", 400))
  }

  const result = await orderService.getNotPayPartnerOrder(
    partnerId,
    tanggalAwal,
    tanggalAkhir
  )

  return response(res, true, result, "Berhasil", 200)
}

const payOrder = async (req, res, next) => {
  const { order } = req
  const { partnerId } = req.params
  const { orderIds } = req.body
  const { tanggalAwal = "", tanggalAkhir = "" } = req.query

  const result = await orderService.payingPartnerOrder({
    order,
    orderIds,
    partnerId,
    tanggalAwal,
    tanggalAkhir,
  })

  response(res, true, result, "berhasil", 200)
}

module.exports = {
  getAllPartner,
  createPartner,
  getSpesificPartner,
  updatePartner,
  deletePartner,
  getAllNotPayOrder,
  payOrder,
}
