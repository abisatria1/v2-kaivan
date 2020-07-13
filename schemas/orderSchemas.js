const Joi = require('joi')

const addOrderSchema = Joi.object().keys({
    nama : Joi.string().required(),
    notelp : Joi.string().required().min(6),
    alamat : Joi.string().allow(''),
    namaKantor : Joi.string().allow(''),
    google : Joi.object({
        googleId : Joi.string().required(),
        etag : Joi.string().allow('')
    }),
    order : Joi.object({
        tanggalOrder : Joi.string().required(),
        jumlah : Joi.number().required().min(1),
        jam : Joi.string().allow(''),
        status : Joi.number().required().min(1),
        keterangan : Joi.string().allow(''),
    }).required(),
    driverId : Joi.array().items(Joi.number()),
    partnerId : Joi.number().required().min(-1)
})

const updateOrderSchema = Joi.object().keys({
    nama : Joi.string().required(),
    notelp : Joi.string().required().min(6),
    alamat : Joi.string().allow(''),
    namaKantor : Joi.string().allow(''),
    google : Joi.object({
        googleId : Joi.string().required(),
        etag : Joi.string().allow('')
    }).required(),
    order : Joi.object({
        jumlah : Joi.number().min(1),
        jam : Joi.string().allow(''),
        status : Joi.number().min(1),
        keterangan : Joi.string().allow(''),
    }).required(),
    driverId : Joi.array().items(Joi.number()),
    partnerId : Joi.number().required().min(-1)
})

module.exports = {
    addOrderSchema,
    updateOrderSchema
}