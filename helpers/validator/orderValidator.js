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

module.exports = {
  setCustomer,
}
