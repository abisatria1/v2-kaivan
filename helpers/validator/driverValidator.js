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

module.exports = {
  checkDriverCache,
}
