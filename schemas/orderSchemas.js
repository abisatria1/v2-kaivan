const Joi = require('joi')

const addOrderSchema = Joi.object().keys({
    customer : Joi.object({
        nama : Joi.string().min(3).required(),
        alamat : Joi.string().required(),
        notelp : Joi.string().required().min(6),
        googleId : Joi.string().allow(''),
        isUpdate : Joi.string().required()
    }).required(),
    order : Joi.object({
        tanggalOrder : Joi.string().required(),
        jumlah : Joi.number().required().min(1),
        jam : Joi.string().allow(''),
        status : Joi.number().required().min(1),
        keterangan : Joi.string().allow(''),
    }).required(),
    driverId : Joi.number().required().min(-1),
    partnerId : Joi.number().required().min(-1)
})

module.exports = {
    addOrderSchema
}