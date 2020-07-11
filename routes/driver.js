const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const {createOrUpdateGoogleContact} = require('../helpers/validator/contactValidator')
const schema = require('../schemas/driverSchema')

// controller
const driverController = require('../controllers/driver')

router.route('/')
    .get(
        driverController.getAllDriver
    )
    .post(
        validateBody(schema.createDriverSchema),
        createOrUpdateGoogleContact(),
        driverController.createDriver
    )

router.route('/:driverId')
    .get(
        driverController.getSpesificDriver
    )
    .patch(
        validateBody(schema.updateDriverSchema),
        createOrUpdateGoogleContact(),
        driverController.updateDriver
    )
    .delete(
        driverController.deleteDriver
    )

module.exports = router