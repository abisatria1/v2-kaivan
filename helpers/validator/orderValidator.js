const { response, customError } = require("../wrapper")
const Customer = require("../../models/Customer")
const Driver = require("../../models/Driver")
const Partner = require("../../models/Partner")

const setCustomer = () => {
  return async (req, res, next) => {
    // kurang update contact jika mengubah keterangan
    const { customer } = req.body
    if (
      customer.googleId != "" ||
      customer.googleId != undefined ||
      customer.googleId != null
    ) {
      // jika google ID tidak ada maka buat contact baru di google contact
    }
    const result = await Customer.create(customer)
    req.customer = result
    next()
  }
}

const checkOrderCache = () => {
  return async (req, res, next) => {
    const { tanggalAwal = "", tanggalAkhir = tanggalAwal } = req.query
    const order = myCache.get(`order_${tanggalAwal}_${tanggalAkhir}`)

    if (order) {
      logger.debug("Ambil data dari cache order")
      return response(res, true, order, "Berhasil", 200)
    }
    logger.debug("Ambil data dari database order")
    return next()
  }
}

module.exports = {
  setCustomer,
  checkOrderCache,
}
