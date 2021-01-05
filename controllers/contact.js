const { response, customError } = require("../helpers/wrapper")
const Op = require("sequelize").Op
// models
const Contact = require("../models/Contact")
const GoogleToken = require("../models/GoogleToken")
// service
const contactService = require("../service/contact")

const getAllContactGoogle = async (req, res, next) => {
  logger.info("running get all google contact data")
  const resArr = await contactService.getGoogleContact()
  logger.info("returning all data...")
  response(
    res,
    true,
    resArr[0].connections,
    `berhasil mendapatkan ${resArr[0].totalPeople} data`,
    200
  )
  logger.info("done")
}

const getAllContact = async (req, res, next) => {
  logger.info("running get database contact data")
  const contact = await contactService.getAllContactInDatabase()
  response(res, true, contact, "Berhasil mendapat semua contact", 200)
  logger.info("sending all contact data")
}

const createContact = async (req, res, next) => {
  logger.info("running create contact data")
  const result = await contactService.createContact(req.body)
  response(res, true, result, "Berhasil membuat kontak", 201)
  logger.info("sending all created data")
}

const getSpesificContact = async (req, res, next) => {
  logger.info("running getSpesific contact data")
  const { contactGoogleId } = req.query
  if (!contactGoogleId)
    return response(res, false, null, "Google id diperlukan", 400)

  let contact = await contactService.getSpesificContact(contactGoogleId)
  if (!contact)
    return response(res, false, null, "Tidak ada kontak dalam database", 400)

  // parsing raw
  contact.raw = JSON.parse(contact.raw)
  response(res, true, contact, "Berhasil mendapatkan data", 200)
  logger.info("sending all spesific contact data")
}

const updateContact = async (req, res, next) => {
  logger.info("running updated contact data")
  const { contactGoogleId } = req.query
  if (!contactGoogleId)
    return response(res, false, null, "Google id diperlukan", 400)

  const prevContact = await contactService.getSpesificContact(contactGoogleId)
  if (!prevContact)
    return response(res, false, null, "Tidak ada kontak dalam database", 400)

  const result = await contactService.updateContact(prevContact, req.body)

  response(res, true, { contact: result }, "Contact berhasil diupdate", 200)
  logger.info("sending all updated contact data")
}

const deleteContact = async (req, res, next) => {
  logger.info("running delete contact data")
  const { contactGoogleId } = req.query
  if (!contactGoogleId)
    return response(res, false, null, "Google id diperlukan", 400)

  const contact = await contactService.getSpesificContact(contactGoogleId)
  if (!contact)
    return response(res, false, null, "Tidak ada kontak dalam database", 400)

  const result = await contactService.deleteContact(contact)
  response(res, true, result, "Contact berhasil dihapus", 200)
  logger.info("Successfully delete data")
}

const syncContact = async (req, res, next) => {
  logger.info("syncing google contact")
  const syncReport = await contactService.syncContactToDatabase()
  logger.info("returning all data...")
  response(res, true, syncReport, "Berhasil mensinkronisasikan data", 200)
  return logger.info("done")
}

const searchContact = async (req, res, next) => {
  const { value } = req.query
  if (value == "" || value == null || !value)
    return next(customError('query "value" dibutuhkan', 400))
  logger.info(`running search by ${value}}`)
  const contact = await contactService.searchContact(value)
  response(res, true, contact, "Berhasil mendapatkan data pelanggan", 200)
}

module.exports = {
  getAllContactGoogle,
  getAllContact,
  createContact,
  getSpesificContact,
  updateContact,
  deleteContact,
  syncContact,
  searchContact,
}
