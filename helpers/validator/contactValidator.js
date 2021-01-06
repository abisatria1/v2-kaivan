const { response, customError } = require("../wrapper")
const contactService = require("../../service/contact")

const createOrUpdateGoogleContact = () => {
  return async (req, res, next) => {
    const { google } = req.body
    let dataContact
    dataContact = { nama, namaKantor, alamat, notelp } = req.body

    if (!google) {
      logger.debug("creating google contact middleware")
      req.contact = await contactService.createContact(dataContact)
      logger.debug("return created google contact from middleware")
    } else {
      logger.debug("updating google contact middleware")
      const contact = await contactService.getSpesificContact(google.googleId)
      if (!contact)
        return response(res, false, null, "tidak ditemukan contact", 400)
      req.contact = await contactService.updateContact(contact, dataContact)
      logger.debug("return updated google contact from middleware")
    }
    next()
  }
}

module.exports = {
  createOrUpdateGoogleContact,
}
