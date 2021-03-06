const { getDriverByDriverCode } = require("../service/driver")

const router = require("express-promise-router")()
const dotenv = require("dotenv").config()

router.route("/").get((req, res, next) => {
  res.redirect("/dashboard")
})

router.route("/dashboard").get((req, res, next) => {
  res.render("dashboard", {
    title: "Dashboard",
    pageCss: "",
  })
})

router.route("/order").get((req, res, next) => {
  res.render("order", {
    title: "Order",
    pageCss: `/css/order.css`,
    helper: "/js/helper/orderHelper.js",
    eventHandler: "/js/eventHandler/orderEventHandler.js",
    systemHandler: "/js/systemHandler/orderSystemHandler.js",
  })
})

router.route("/jasa").get((req, res, next) => {
  res.render("jasa", {
    title: "Jasa",
    pageCss: "/css/jasa.css",
    eventHandler: "/js/eventHandler/jasaEventHandler.js",
    systemHandler: "/js/systemHandler/jasaSystemHandler.js",
  })
})

router.route("/sopir").get((req, res, next) => {
  res.render("sopir", {
    title: "Sopir",
    pageCss: "/css/sopir.css",
    eventHandler: "/js/eventHandler/sopirEventHandler.js",
    systemHandler: "/js/systemHandler/sopirSystemHandler.js",
    base_url: process.env.BASE_URL,
  })
})

router.route("/sopir/detail/:kodeSopir").get(async (req, res, next) => {
  res.render("detailSopir", {
    kodeSopir: req.params.kodeSopir,
    title: "Detail Sopir",
    pageCss: "/css/detailSopir.css",
    eventHandler: "/js/eventHandler/detailSopirEventHandler.js",
    systemHandler: "/js/systemHandler/detailSopirSystemHandler.js",
    helper: "/js/helper/detailSopirHelper.js",
    base_url: process.env.BASE_URL,
  })
})

router.route("/client").get((req, res, next) => {
  res.render("client", {
    title: "Client",
    pageCss: "/css/client.css",
    eventHandler: "/js/eventHandler/clientEventHandler.js",
    systemHandler: "/js/systemHandler/clientSystemHandler.js",
    helper: "/js/helper/clientHelper.js",
    base_url: process.env.BASE_URL,
  })
})

router.route("/contact").get((req, res, next) => {
  res.render("contact", {
    title: "contact",
    pageCss: "",
  })
})

router.route("/index").get((req, res, next) => {
  res.render("index")
})

router.route("/login").get((req, res, next) => {
  if (req.query.user) {
    return res.render("login", { layout: false, user: req.query.user })
  }
  res.render("login", { layout: false })
})

module.exports = router
