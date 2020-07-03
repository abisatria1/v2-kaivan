const Joi = require('joi')

const createPartnerSchema = Joi.object().keys({
    nama : Joi.string().required().min(3),
    notelp : Joi.string().required().min(6),
    alamat : Joi.string().allow(''),
    norek : Joi.string().allow(''),
    statusJasa : Joi.string(),
    tipePembayaran : Joi.number().min(1).required(),
    keterangan : Joi.string().allow('')
})

module.exports = {
    createPartnerSchema
}