const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/driverSchema')

// controller
const driverController = require('../controllers/driver')

router.route('/')
    .get(
        driverController.getAllDriver
    )
    .post(
        validateBody(schema.createDriverSchema),
        driverController.createDriver
    )

router.route('/:driverId')
    .get(
        driverController.getSpesificDriver
    )
    .patch(
        validateBody(schema.updateDriverSchema),
        driverController.updateDriver
    )
    .delete(
        driverController.deleteDriver
    )

module.exports = router