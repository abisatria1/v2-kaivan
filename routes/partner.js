const router = require('express-promise-router')()
const {validateBody} = require('../helpers/validator/validateBody')
const schema = require('../schemas/partnerSchema')

// controller
const partnerController = require('../controllers/partner')

router.route('/')
    .get(
        partnerController.getAllPartner
    )
    .post(
        validateBody(schema.createPartnerSchema),
        partnerController.createPartner
    )

router.route('/:partnerId')
    .get(
        partnerController.getSpesificPartner
    )
    .patch(
        validateBody(schema.createPartnerSchema),
        partnerController.updatePartner
    )
    .delete(
        partnerController.deletePartner
    )

module.exports = router