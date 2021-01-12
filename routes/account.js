const router = require("express-promise-router")()
const { validateBody } = require("../helpers/validator/validateBody")
const passport = require("passport")
const passportConfig = require("../helpers/auth")
// controller
const accountController = require("../controllers/account")

router.route("/googleOauth").get(
  passport.authenticate("google", {
    scope: [
      "https://www.googleapis.com/auth/contacts",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ],
    accessType: "offline",
    prompt: "consent",
  })
)

router.route("/google").get(
  passport.authenticate("google", {
    session: false,
    failureRedirect: "/login?user=false",
  }),
  accountController.successAuth
)

module.exports = router
