const router = require("express-promise-router")()
const { validateBody } = require("../helpers/validator/validateBody")
const {
  createOrUpdateGoogleContact,
} = require("../helpers/validator/contactValidator")
const schema = require("../schemas/partnerSchema")
// validator
const validator = require("../helpers/validator/partnerValidator")
// controller
const partnerController = require("../controllers/partner")

router
  .route("/")
  .get(partnerController.getAllPartner)
  .post(
    validateBody(schema.createPartnerSchema),
    createOrUpdateGoogleContact(),
    partnerController.createPartner
  )

router
  .route("/order/:partnerId")
  .get(partnerController.getAllNotPayOrder)
  .post(
    validateBody(schema.payOrderSchema),
    validator.isValidOrderIds(),
    partnerController.payOrder
  )

router
  .route("/:partnerId")
  .get(partnerController.getSpesificPartner)
  .patch(
    validateBody(schema.createPartnerSchema),
    createOrUpdateGoogleContact(),
    partnerController.updatePartner
  )
  .delete(partnerController.deletePartner)

module.exports = router
