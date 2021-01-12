const router = require("express-promise-router")()
const { validateBody } = require("../helpers/validator/validateBody")
const {
  createOrUpdateGoogleContact,
} = require("../helpers/validator/contactValidator")
const schema = require("../schemas/driverSchema")
const validator = require("../helpers/validator/driverValidator")
// controller
const driverController = require("../controllers/driver")
const { deleteCacheMiddleware } = require("../helpers/cache")

router
  .route("/")
  .get(validator.checkDriverCache(), driverController.getAllDriver)
  .post(
    deleteCacheMiddleware(),
    validateBody(schema.createDriverSchema),
    createOrUpdateGoogleContact(),
    driverController.createDriver
  )

router
  .route("/order/:driverCode")
  .get(driverController.getNotCheckOrder)
  .post(
    deleteCacheMiddleware(),
    validateBody(schema.checkOrderSchmea),
    driverController.checkOrder
  )

router
  .route("/:driverId")
  .get(driverController.getSpesificDriver)
  .patch(
    deleteCacheMiddleware(),
    validateBody(schema.updateDriverSchema),
    createOrUpdateGoogleContact(),
    driverController.updateDriver
  )
  .delete(deleteCacheMiddleware(), driverController.deleteDriver)

module.exports = router
