const router = require("express-promise-router")()
const { validateBody } = require("../helpers/validator/validateBody")
const schema = require("../schemas/orderSchemas")
const validator = require("../helpers/validator/orderValidator")
const {
  createOrUpdateGoogleContact,
} = require("../helpers/validator/contactValidator")
const { deleteCacheMiddleware } = require("../helpers/cache")

// controller
const orderController = require("../controllers/order")

router
  .route("/")
  .get(validator.checkOrderCache(), orderController.getAllOrderByDate)
  .post(
    deleteCacheMiddleware(),
    validateBody(schema.addOrderSchema),
    createOrUpdateGoogleContact(),
    orderController.addOrder
  )

router
  .route("/:orderId")
  .patch(
    deleteCacheMiddleware(),
    validateBody(schema.updateOrderSchema),
    createOrUpdateGoogleContact(),
    orderController.updateOrder
  )
  .delete(deleteCacheMiddleware(), orderController.deleteOrder)

module.exports = router
