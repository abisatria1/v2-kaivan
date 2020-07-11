const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/contactSchema')
const passport = require('passport')
const passportConfig = require('../helpers/auth')
// controller
const contactController = require('../controllers/contact')

router.route('/google')
    .get(
        contactController.getAllContactGoogle
    )

router.route('/')
    .get(
        contactController.getAllContact
    )
    .post(
        validateBody(schema.createContactSchema),
        contactController.createContact
    )

router.route('/spesific')
    .patch(
        validateBody(schema.updateSchema),
        contactController.updateContact
    )
    .get(
        contactController.getSpesificContact
    )
    .delete(
        contactController.deleteContact
    )

router.route('/syncContact')
    .get(
        contactController.syncContact
    )


module.exports = router
