const { response, customError } = require("../helpers/wrapper")
const driverService = require("../service/driver")
const orderService = require("../service/order")

const getAllDriver = async (req, res, next) => {
  const drivers = await driverService.getAllDriver()
  myCache.set("driver", drivers)
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

const getNotCheckOrder = async (req, res, next) => {
  const { driverCode } = req.params
  const { tanggalAwal = "", tanggalAkhir = "" } = req.query

  if (tanggalAwal != "" && isNaN(new Date(tanggalAwal).getTime())) {
    return next(customError("Invalid date", 400))
  }
  if (tanggalAkhir != "" && isNaN(new Date(tanggalAkhir).getTime())) {
    return next(customError("Invalid date", 400))
  }

  const driverOrder = await orderService.getNotCheckedOrderByDriver(
    driverCode,
    tanggalAwal,
    tanggalAkhir
  )
  return response(res, true, driverOrder, "Berhasil", 200)
}

const checkOrder = async (req, res, next) => {
  const { driverCode } = req.params
  const { orderIds } = req.body
  const result = await orderService.checkDriverOrder(driverCode, orderIds)
  return response(res, true, result, "Berhasil", 200)
}

module.exports = {
  getAllDriver,
  createDriver,
  getSpesificDriver,
  updateDriver,
  deleteDriver,
  getNotCheckOrder,
  checkOrder,
}
