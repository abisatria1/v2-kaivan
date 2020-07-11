const Joi = require('joi')

const createDriverSchema = Joi.object().keys({
    nama : Joi.string().required().min(3),
    kodeSopir : Joi.string().required(),
    notelp : Joi.string().required().min(6),
    alamat : Joi.string().allow(''),
    keterangan : Joi.string().allow(''),
    google : Joi.object({
        googleId : Joi.string().required(),
        etag : Joi.string().required()
    })
})

const updateDriverSchema = Joi.object().keys({
    nama : Joi.string().min(3),
    kodeSopir : Joi.string(),
    notelp : Joi.string().min(6),
    alamat : Joi.string().allow(''),
    keterangan : Joi.string().allow('')
})

module.exports = {
    createDriverSchema,
    updateDriverSchema
}