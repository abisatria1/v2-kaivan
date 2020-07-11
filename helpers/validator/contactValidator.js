const Contact = require('../../models/Contact')
const {createGoogleContact,updateGoogleContact} = require('../googleContact')
const { response,customError } = require('../wrapper')

const createOrUpdateGoogleContact = () => {
    return async (req,res,next) => {
        const {google} = req.body
        let googleContact , dataContact

        if (!google) {
            logger.debug('creating google contact middleware')
            // create google contact
            dataContact = {nama,namaKantor,alamat,notelp} = req.body
            googleContact = await createGoogleContact(dataContact)

            dataContact.googleId = googleContact.resourceName
            dataContact.etag = googleContact.etag
            dataContact.raw = JSON.stringify(googleContact)
            dataContact.notelp = googleContact.phoneNumbers[0].canonicalForm

            await Contact.create(dataContact)
            req.contact = googleContact
            logger.debug('return created google contact from middleware')
        }else {
            logger.debug('updating google contact middleware')
            // update google contact
            const contact = await Contact.findByPk(google.googleId)
            if (!contact) return response(res,false,null,'tidak ditemukan contact',400)
            const prev = {googleId,etag} = contact
            // update google contact dan contact db
            dataContact = {nama,namaKantor,alamat,notelp} = req.body
            googleContact = await updateGoogleContact(prev,dataContact)
            
            dataContact.etag = googleContact.etag
            dataContact.raw = JSON.stringify(googleContact)
            dataContact.notelp = googleContact.phoneNumbers[0].canonicalForm
            
            await contact.update(dataContact)
            req.contact = googleContact
            logger.debug('return updated google contact from middleware')
        }
        next()
    }
}

module.exports = {
    createOrUpdateGoogleContact
}