const { response, customError } = require("../wrapper")

const checkDriverCache = () => {
  return async (req, res, next) => {
    const driver = myCache.get(`driver`)
    if (driver) {
      logger.debug("Ambil data dari cache driver")
      return response(res, true, driver, "Berhasil", 200)
    }
    logger.debug("Ambil data dari database driver")
    return next()
  }
}

const checkDriverNotCheckOrderCache = () => {
  return async (req, res, next) => {
    const { tanggalAwal = "", tanggalAkhir = tanggalAwal } = req.query
    const { driverCode } = req.params

    const order = myCache.get(
      `not_check_order_${driverCode}_${tanggalAwal}_${tanggalAkhir}`
    )
    if (order) {
      logger.debug("Ambil data dari cache order not check")
      return response(res, true, order, "berhasil", 200)
    }
    logger.debug("Ambil data dari database not check order")
    return next()
  }
}

module.exports = {
  checkDriverCache,
  checkDriverNotCheckOrderCache,
}
