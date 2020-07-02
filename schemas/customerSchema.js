const Joi  = require('joi')

const createCustomerSchema = Joi.object().keys({
    nama : Joi.string().min(3).required(),
    alamat : Joi.string().required(),
    notelp : Joi.string().required().min(6)
})

module.exports = {
    createCustomerSchema
}