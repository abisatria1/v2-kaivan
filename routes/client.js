const router = require("express-promise-router")()
const clientController = require("../controllers/client")

router.route("/ip").post(clientController.saveClientIpInformation)
router.route("/api/client").get(clientController.getAllClientData)

module.exports = router
