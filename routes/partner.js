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
const { deleteCacheMiddleware } = require("../helpers/cache")

router
  .route("/")
  .get(validator.checkPartnerCache(), partnerController.getAllPartner)
  .post(
    deleteCacheMiddleware(),
    validateBody(schema.createPartnerSchema),
    createOrUpdateGoogleContact(),
    partnerController.createPartner
  )

router
  .route("/order/:partnerId")
  .get(partnerController.getAllNotPayOrder)
  .post(
    deleteCacheMiddleware(),
    validateBody(schema.payOrderSchema),
    validator.isValidOrderIds(),
    partnerController.payOrder
  )

router
  .route("/:partnerId")
  .get(partnerController.getSpesificPartner)
  .patch(
    deleteCacheMiddleware(),
    validateBody(schema.createPartnerSchema),
    createOrUpdateGoogleContact(),
    partnerController.updatePartner
  )
  .delete(deleteCacheMiddleware(), partnerController.deletePartner)

module.exports = router
