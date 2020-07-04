const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/customerSchema')
const passport = require('passport')
const passportConfig = require('../helpers/auth')
// controller
const customerController = require('../controllers/customer')
const axios = require('axios')


router.route('/')
    .get(
        customerController.getAllCustomer
    )
    .post(
        validateBody(schema.createCustomerSchema),
        customerController.createCustomer
    )

router.route('/personal/:customerId')
    .get(
        customerController.getSpesificCustomer
    )
    .patch (
        validateBody(schema.createCustomerSchema),
        customerController.updateCustomer
    )

router.route('/search/:param')
    .get(
        customerController.searchByParam
    )
    
router.route('/googleOauth')
    .get(passport.authenticate('google', {scope : [
        'https://www.googleapis.com/auth/contacts',
        'https://www.googleapis.com/auth/userinfo.email',
        'https://www.googleapis.com/auth/userinfo.profile'
    ], 
    accessType: 'offline', approvalPrompt: 'force'}))

router.route('/google')
    .get(
        passport.authenticate('google', {session : false}),
        customerController.successAuth
    )

router.route('/get')
    .get(
        customerController.getAllContact
    )

router.route('/syncContact')
    .get(
        customerController.syncContact
    )

router.route('/saveDatabase')
    .get(
        customerController.saveContactToDatabase
    )



module.exports = router