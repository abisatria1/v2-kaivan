const express = require("express")
const app = express()
const bodyParser = require("body-parser")
const dotenv = require("dotenv").config()
const path = require("path")
const hbs = require("express-handlebars")
const { setGoogleClient } = require("./helpers/googleClient")
const { google } = require("googleapis")

// another file
const { response } = require("./helpers/wrapper.js")
const cors = require("cors")
const cron = require("node-cron")
// database and relation
const db = require("./config/database")
const relation = require("./config/relation")
const Secret = require("./models/Secret")
// service
const contactService = require("./service/contact")
// global
const cacheConf = require("./config/cache")
const loggerConf = require("./config/logger")

app.engine(
  "hbs",
  hbs({
    extname: "hbs",
    defaultLayout: "default",
    layoutsDir: __dirname + "/views/layouts/",
    partialsDir: __dirname + "/views/partials/",
    helpers: {
      toJSON: function (object) {
        console.log(object)
        return JSON.stringify(object)
      },
    },
  })
)
app.set("view engine", "hbs")
app.set("views", path.join(__dirname, "views"))
app.use(express.static(path.join(__dirname, "/public")))

// middleware
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(cors())

app.use((req, res, next) => {
  logger.debug(myCache.keys())
  next()
})

cron.schedule("*/2 * * * *", async () => {
  logger.debug("Setting google client")
  let secret = await Secret.findAll({})
  if (!secret.length) return logger.error("Secret is empty, please login first")

  secret = secret[0]
  access_token = secret.accessToken
  refresh_token = secret.refreshToken
  logger.debug("refreshToken = " + refresh_token)

  // make google client
  const oAuth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  )
  oAuth2Client.setCredentials({ refresh_token })
  google.options({
    auth: oAuth2Client,
  })

  logger.debug("begin sync with cron job")
  report = await contactService.syncContactToDatabase()
  logger.debug("done")
})

// router
const driverRouter = require("./routes/driver")
const partnerRouter = require("./routes/partner")
const orderRouter = require("./routes/order")
const viewsRouter = require("./routes/views")
const contactRouter = require("./routes/contact")
const accountRouter = require("./routes/account")
const Client = require("./models/Client")
app.use(viewsRouter)
app.use("/api/contact", setGoogleClient(), contactRouter)
app.use("/api/driver", setGoogleClient(), driverRouter)
app.use("/api/partner", setGoogleClient(), partnerRouter)
app.use("/api/order", setGoogleClient(), orderRouter)
app.use("/api/account", accountRouter)

app.use("/unauthorized", (req, res, next) => {
  let err = new Error("Unauthorized access")
  err.status = 401
  next(err)
})

app.use("/hello", (req, res, next) =>
  res.send("Application successfuly deploy, welcome to the API")
)

app.use("/ip", async (req, res, next) => {
  const desc = req.query.desc ? req.query.desc : ""
  const ip =
    req.headers["x-forwarded-for"] ||
    req.connection.remoteAddress ||
    req.socket.remoteAddress ||
    (req.connection.socket ? req.connection.socket.remoteAddress : null)
  const create = await Client.create({ ip_address: ip, desc })
  return response(res, true, create, "Berhasil Mencatat ip", 200)
})

// error handling
app.use((req, res, next) => {
  let err = new Error("Route tidak ditemukan")
  err.status = 404
  next(err)
})

app.use((err, req, res, next) => {
  console.error(err)
  logger.error(err.message)
  const { message } = err
  const status = err.status || 500
  const data = err.data || null
  response(res, false, data, message, status)
})

const port = process.env.PORT || 3000

app.listen(port, () => {
  db.sync({ force: false })
    .then(() => logger.debug(`app is running on port ${port}`))
    .catch((err) => logger.error(err.message))
})
