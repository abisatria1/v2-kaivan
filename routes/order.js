const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/orderSchemas')
const validator = require('../helpers/validator/orderValidator')

// controller
const orderController = require('../controllers/order')


router.route('/')
    .get(
        orderController.getAllOrderByDate
    )
    .post(
        validateBody(schema.addOrderSchema),
        validator.setCustomer(),
        orderController.addOrder
    )

module.exports = router