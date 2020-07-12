const Joi  = require('joi')

const createCustomerSchema = Joi.object().keys({
    nama : Joi.string().required(),
    alamat : Joi.string().required(),
    notelp : Joi.string().required().min(6),
    namaKantor : Joi.string().allow("")
})

module.exports = {
    createCustomerSchema
}