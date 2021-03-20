const router = require("express-promise-router")()
const Client = require("../models/Client")
const { response, customError } = require("../helpers/wrapper")

router.route("/ip").post(async (req, res, next) => {
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  const create = await Client.create({ ...req.body, ipAddress: ip })
  return response(res, true, create, "Berhasil Mencatat ip", 200)
})

module.exports = router
