const Joi = require("joi")

const createDriverSchema = Joi.object().keys({
  nama: Joi.string().required(),
  kodeSopir: Joi.string().required(),
  notelp: Joi.string().required().min(6),
  alamat: Joi.string().allow(""),
  keterangan: Joi.string().allow(""),
  namaKantor: Joi.string().allow(""),
  google: Joi.object({
    googleId: Joi.string().required(),
    etag: Joi.string().allow(""),
  }),
})

const updateDriverSchema = Joi.object().keys({
  nama: Joi.string().required(),
  kodeSopir: Joi.string().required(),
  notelp: Joi.string().min(6).required(),
  alamat: Joi.string().allow(""),
  keterangan: Joi.string().allow(""),
  namaKantor: Joi.string().allow(""),
  google: Joi.object({
    googleId: Joi.string().required(),
    etag: Joi.string().allow(""),
  }).required(),
})

const checkOrderSchmea = Joi.object().keys({
  orderIds: Joi.array().items(Joi.number()).required(),
})

module.exports = {
  createDriverSchema,
  updateDriverSchema,
  checkOrderSchmea,
}
