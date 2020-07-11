const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/customerSchema')
const passport = require('passport')
const passportConfig = require('../helpers/auth')
const axios = require('axios')
// controller
const customerController = require('../controllers/customer')
const { setGoogleClient } = require('../helpers/googleClient')


router.route('/')
    .get(
        
        customerController.getAllCustomer
    )
    .post(
        setGoogleClient(),
        validateBody(schema.createCustomerSchema),
        customerController.createCustomer
    )

router.route('/personal/:customerId')
    .get(
        setGoogleClient(),
        customerController.getSpesificCustomer
    )
    .patch (
        setGoogleClient(),
        validateBody(schema.createCustomerSchema),
        customerController.updateCustomer
    )
    .delete(
        setGoogleClient(),
        customerController.deleteCustomer
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
    accessType: 'offline',prompt: 'consent',
    }))

router.route('/google')
    .get(
        passport.authenticate('google', {session : false}),
        customerController.successAuth
    )

router.route('/get')
    .get(
        setGoogleClient(),
        customerController.getAllContact
    )

router.route('/syncContact')
    .get(
        setGoogleClient(),
        customerController.syncContact
    )

router.route('/saveDatabase')
    .get(
        setGoogleClient(),
        customerController.saveContactToDatabase
    )



module.exports = router