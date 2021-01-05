const { response, customError } = require("../helpers/wrapper")
const refresh = require("passport-oauth2-refresh")
const GoogleToken = require("../models/GoogleToken")
const Secret = require("../models/Secret")
const fs = require("fs")
const Op = require("sequelize").Op
const { google } = require("googleapis")

// contact helper
const {
  getContact,
  createGoogleContact,
  updateGoogleContact,
  saveSyncContact,
  deleteGoogleContact,
  createNewArr,
} = require("../helpers/googleContact")

// models
const Customer = require("../models/Customer")

const getAllCustomer = async (req, res, next) => {
  const customer = await Customer.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "raw"] },
    limit: 100,
  })
  response(
    res,
    true,
    { customer, total: customer.length },
    "Semua data pelanggan berhasil di dapatkan",
    200
  )
}

const getSpesificCustomer = async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.customerId)
  if (!customer) return next(customError("Data pelanggan tidak ada", 400))
  response(res, true, customer, "Berhasil mendapatkan data pelanggan", 200)
}

const createCustomer = async (req, res, next) => {
  const { oAuth2Client } = req
  const service = google.people({ version: "v1", auth: oAuth2Client })
  console.log("creating customer")
  let contact
  contact = await createGoogleContact(req.body, service)
  console.log(contact)
  req.body.googleId = contact.resourceName
  req.body.etag = contact.etag
  req.body.raw = JSON.stringify(contact)
  req.body.notelp = contact.phoneNumbers[0].canonicalForm
  const customer = await Customer.create(req.body)
  response(
    res,
    true,
    { customer, googleContact: contact },
    "Customer berhasil dibuat",
    201
  )
  return console.log("done")
}

const updateCustomer = async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.customerId)
  if (!customer) return next(customError("Tidak ada data pelanggan", 400))
  const { oAuth2Client } = req
  const service = google.people({ version: "v1", auth: oAuth2Client })
  // update customer contact google
  let update
  update = await updateGoogleContact(customer, req.body, service)

  req.body.etag = update.etag
  req.body.raw = JSON.stringify(update)
  req.body.notelp = update.phoneNumbers[0].canonicalForm
  await customer.update(req.body)
  const result = await Customer.findByPk(customer.id)
  response(
    res,
    true,
    { result, googleContact: update },
    "Customer berhasil diupdate",
    200
  )
}

const deleteCustomer = async (req, res, next) => {
  const customer = await Customer.findByPk(req.params.customerId)
  if (!customer) return next(customError("Data pelanggan tidak ditemukan", 400))
  await customer.destroy()
  const { oAuth2Client } = req
  const service = google.people({ version: "v1", auth: oAuth2Client })
  const delCustomer = await deleteGoogleContact(customer.googleId, service)
  response(res, true, {}, "Pelanggan berhasil dihapus", 200)
}

/* 
param dapat berupa :
1. nama
2. alamat
3. notelp
*/
const searchByParam = async (req, res, next) => {
  const { param } = req.params
  const { value } = req.query
  let query
  if (value == "" || value == null || !value)
    return next(customError('query "value" dibutuhkan', 400))
  switch (param) {
    case "nama":
      query = { nama: { [Op.like]: `%${value}%` } }
      break
    case "alamat":
      query = { alamat: { [Op.like]: `%${value}%` } }
      break
    case "notelp":
      query = { notelp: { [Op.like]: `%${value}%` } }
      break
    default:
      break
  }
  console.log(query)
  if (!query) return next(customError("param tidak valid", 400))
  const customer = await Customer.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    where: query,
    limit: 20,
  })
  response(res, true, customer, "Berhasil mendapatkan data pelanggan", 200)
}

const successAuth = async (req, res, next) => {
  if (!req.user || req.user == null) {
    return res.redirect("/login?user=" + "false")
  }
  res.redirect("/login?user=" + JSON.stringify(req.user))
}

// contact middleware
const getAllContact = async (req, res, next) => {
  const { oAuth2Client } = req
  const service = google.people({ version: "v1", auth: oAuth2Client })

  // fetching all data
  let result,
    i = 1,
    resArr = [],
    totalPeople = 0
  let nextPageToken, syncToken, nextSyncToken

  while (nextPageToken || i == 1) {
    result = await getContact(service, nextPageToken)
    resArr.push(result)
    nextPageToken = result.nextPageToken ? result.nextPageToken : undefined
    syncToken = result.syncToken ? result.syncToken : undefined
    nextSyncToken = result.nextSyncToken ? result.nextSyncToken : undefined
    if (result.connections) totalPeople += result.connections.length
    console.log(`fetcing ${i} with total people = ${totalPeople}`)
    i++
  }
  if (syncToken != "" || nextSyncToken != "") {
    console.log({ syncToken, nextSyncToken })
    // update token
    const token = nextSyncToken || syncToken
    console.log(token)
    // update
    if (token) {
      await GoogleToken.update({ syncToken: token }, { where: { id: 1 } })
      console.log("updated sync token")
    }
  }
  console.log("returning all data...")
  response(res, true, resArr, `berhasil mendapatkan ${totalPeople}`, 200)
  console.log("done")
}

const syncContact = async (req, res, next) => {
  const googleToken = await GoogleToken.findByPk(1)
  if (!googleToken.syncToken)
    return next(customError("sync token tidak ada", 400))
  const { oAuth2Client } = req
  const service = google.people({ version: "v1", auth: oAuth2Client })
  // fetching all data
  let result,
    i = 1,
    resArr = [],
    totalPeople = 0
  let nextPageToken, syncToken, nextSyncToken
  while (nextPageToken || i == 1) {
    result = await getContact(service, nextPageToken, googleToken.syncToken)
    resArr.push(result)
    nextPageToken = result.nextPageToken ? result.nextPageToken : undefined
    syncToken = result.syncToken ? result.syncToken : undefined
    nextSyncToken = result.nextSyncToken ? result.nextSyncToken : undefined
    if (result.connections) totalPeople += result.connections.length
    console.log(`fetcing ${i} with total people = ${totalPeople}`)
    i++
  }
  if (syncToken || nextSyncToken) {
    console.log({ syncToken, nextSyncToken })
    // update token
    const token = nextSyncToken || syncToken
    console.log(token)
    // update
    if (token) {
      await GoogleToken.update({ syncToken: token }, { where: { id: 1 } })
      console.log("updated sync token")
    }
  }
  // sync with database
  console.log("syncing with database")
  let syncDb = {}
  syncDb = await saveSyncContact(resArr)
  console.log("returning all data...")
  response(
    res,
    true,
    { totalPeople, syncDb, googleSync: resArr },
    "Berhasil mensinkronisasikan data",
    200
  )
  return console.log("done")
}

const saveContactToDatabase = async (req, res, next) => {
  console.log("get json data")
  let customerDataToDatabase = JSON.parse(
    fs.readFileSync("dataPhone.json", "utf8")
  )
  customerDataToDatabase = customerDataToDatabase.data
  let index = 0
  let hasil = 0
  const arr = await createNewArr(customerDataToDatabase)
  for (let i = 0; i < 20; i++) {
    await Customer.bulkCreate(arr[i])
    console.log("inserting..... :     " + i)
    index++
  }
  response(res, true, {}, `Berhasil memasukan data`, 201)
}

module.exports = {
  getAllCustomer,
  getSpesificCustomer,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  getAllContact,
  successAuth,
  syncContact,
  saveContactToDatabase,
  searchByParam,
}
