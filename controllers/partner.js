const { response, customError } = require("../helpers/wrapper")
const partnerService = require("../service/partner")

const getAllPartner = async (req, res, next) => {
  const partner = await partnerService.getAllPartner()
  response(res, true, partner, "Data jasa berhasil didapatkan", 200)
}

const createPartner = async (req, res, next) => {
  const { contact } = req
  const partner = await partnerService.createPartner(contact, req.body)
  response(res, true, partner, "Berhasil menambahkan data jasa", 200)
}

const getSpesificPartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  response(res, true, partner, "Berhasil mendapatkan data jasa", 200)
}

const updatePartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  const update = await partnerService.updatePartner(partner, req.body)
  response(res, true, update, "Data jasa berhasil diupdate", 200)
}

const deletePartner = async (req, res, next) => {
  const partner = await partnerService.getSpesificPartner(req.params.partnerId)
  if (!partner) return next(customError("Data jasa tidak ditemukan", 400))
  const delPartner = await partnerService.deletePartner(partner)
  response(res, true, delPartner, "Data jasa berhasil di hapus", 200)
}

module.exports = {
  getAllPartner,
  createPartner,
  getSpesificPartner,
  updatePartner,
  deletePartner,
}
