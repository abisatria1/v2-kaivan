const Joi = require('joi')

const createDriverSchema = Joi.object().keys({
    nama : Joi.string().required().min(3),
    kodeSopir : Joi.string().required(),
    notelp : Joi.string().required().min(6),
    alamat : Joi.string().allow(''),
    keterangan : Joi.string().allow('')
})

module.exports = {
    createDriverSchema
}