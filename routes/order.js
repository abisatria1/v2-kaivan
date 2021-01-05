const router = require("express-promise-router")()
const { validateBody } = require("../helpers/validator/validateBody")
const schema = require("../schemas/orderSchemas")
const validator = require("../helpers/validator/orderValidator")
const {
  createOrUpdateGoogleContact,
} = require("../helpers/validator/contactValidator")

// controller
const orderController = require("../controllers/order")

router
  .route("/")
  .get(orderController.getAllOrderByDate)
  .post(
    validateBody(schema.addOrderSchema),
    createOrUpdateGoogleContact(),
    orderController.addOrder
  )

router
  .route("/:orderId")
  .patch(
    validateBody(schema.updateOrderSchema),
    createOrUpdateGoogleContact(),
    orderController.updateOrder
  )
  .delete(orderController.deleteOrder)

module.exports = router
