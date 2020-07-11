const Contact = require('../../models/Contact')
const {createGoogleContact,updateGoogleContact} = require('../googleContact')
const { response } = require('express')

const createOrUpdateGoogleContact = () => {
    return async (req,res,next) => {
        const {google} = req
        if (!google) {
            logger.debug('creating google contact middleware')
            // create google contact

        }else {
            logger.debug('updating google contact middleware')
            // update google contact
            const contact = await Contact.findByPk(googleId)
            if (!contact) return response(res,false,null,'tidak ditemukan contact',400)
            // update google contact dan contact db
            const dataContact = {nama,namaKantor,alamat,notelp} = req.body
            
        }
    }
}