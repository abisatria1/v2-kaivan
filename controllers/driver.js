const { response, customError } = require("../helpers/wrapper")
const driverService = require("../service/driver")

const getAllDriver = async (req, res, next) => {
  const drivers = await driverService.getAllDriver()
  response(res, true, drivers, "Data sopir berhasil didapatkan", 200)
}

const createDriver = async (req, res, next) => {
  const { contact } = req
  const driver = await driverService.createDriver(contact, req.body)
  response(res, true, { driver }, "Berhasil menambahkan data driver", 201)
}

const getSpesificDriver = async (req, res, next) => {
  const driver = await driverService.getSpesificDriver(req.params.driverId)
  if (!driver) return next(customError("Data sopir tidak ditemukan", 400))
  response(res, true, driver, "Berhasil mendapatkan data driver", 200)
}

const updateDriver = async (req, res, next) => {
  const driver = await driverService.getSpesificDriver(req.params.driverId)
  if (!driver) return next(customError("Data sopir tidak ditemukan", 400))
  const update = await driverService.updateDriver(driver, req.body)
  response(
    res,
    true,
    { update, contact: req.contact },
    "Data sopir berhasil diupdate",
    200
  )
}

const deleteDriver = async (req, res, next) => {
  const driver = await driverService.getSpesificDriver(req.params.driverId)
  if (!driver) return next(customError("Data sopir tidak ditemukan", 400))
  const delDriver = await driverService.deleteDriver(driver)
  response(res, true, delDriver, "Data sopir berhasil di hapus", 200)
}

module.exports = {
  getAllDriver,
  createDriver,
  getSpesificDriver,
  updateDriver,
  deleteDriver,
}
