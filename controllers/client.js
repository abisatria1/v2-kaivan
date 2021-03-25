const { customError, response } = require("../helpers/wrapper")
const clientService = require("../service/client")

const saveClientIpInformation = async (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  const create = await clientService.create({ ...req.body, ipAddress: ip })
  return response(res, true, create, "Berhasil Mencatat ip", 200)
}

const getAllClientData = async (req, res, next) => {
  const { tanggalAwal = "", tanggalAkhir = "" } = req.query
  if (tanggalAwal == "" || tanggalAkhir == "")
    return next(customError("Date not valid", 400))
  const clients = await clientService.getData(tanggalAwal, tanggalAkhir)
  return response(res, true, clients, "Berhasil", 200)
}

module.exports = {
  saveClientIpInformation,
  getAllClientData,
}
