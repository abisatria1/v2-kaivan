// models
const Contact = require("../models/Contact")
const Driver = require("../models/Driver")

const getAllDriver = async () => {
  return await Driver.findAll({
    include: [
      {
        model: Contact,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "raw"] },
      },
    ],
  })
}

const createDriver = async (contact, driverRequestData) => {
  return await Driver.create({
    ...driverRequestData,
    contactGoogleId: contact.googleId,
  })
}

const getSpesificDriver = async (driverId) => {
  return await Driver.findOne({
    where: { id: driverId },
    include: [Contact],
  })
}

const updateDriver = async (prevDriver, newDriver) => {
  return await prevDriver.update(newDriver)
}

const deleteDriver = async (driver) => {
  await driver.destroy()
  return {}
}

module.exports = {
  getAllDriver,
  createDriver,
  getSpesificDriver,
  updateDriver,
  deleteDriver,
}
