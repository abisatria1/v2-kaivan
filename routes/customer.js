const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/customerSchema')
const passport = require('passport')
const passportConfig = require('../helpers/auth')
// controller
const customerController = require('../controllers/customer')
const axios = require('axios')
const customer = require('../controllers/customer')


router.route('/')
    .get(
        customerController.getAllCustomer
    )
    .post(
        validateBody(schema.createCustomerSchema),
        customerController.createCustomer
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



module.exports = router