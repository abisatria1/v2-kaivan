const Joi = require('joi')

const createContactSchema = Joi.object().keys({
    nama : Joi.string().required(),
    alamat : Joi.string().allow(""),
    notelp : Joi.string().required().min(6),
    namaKantor : Joi.string().allow("")
})

const updateSchema = Joi.object().keys({
    nama : Joi.string().required(),
    alamat : Joi.string().allow(""),
    notelp : Joi.string().required().min(6),
    namaKantor : Joi.string().allow(""),
})

module.exports = {
    createContactSchema,
    updateSchema
}