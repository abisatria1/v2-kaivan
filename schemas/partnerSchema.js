const Joi = require("joi")

const createPartnerSchema = Joi.object().keys({
  nama: Joi.string().required(),
  notelp: Joi.string().required().min(6),
  alamat: Joi.string().allow(""),
  norek: Joi.string().allow(""),
  statusJasa: Joi.string(),
  tipePembayaran: Joi.number().min(1).required(),
  keterangan: Joi.string().allow(""),
  namaKantor: Joi.string().allow(""),
  google: Joi.object({
    googleId: Joi.string().required(),
    etag: Joi.string().allow(""),
  }),
})

const updatePartnerSchema = Joi.object().keys({
  nama: Joi.string().required(),
  notelp: Joi.string().required().min(6),
  alamat: Joi.string().allow(""),
  norek: Joi.string().allow(""),
  statusJasa: Joi.string(),
  tipePembayaran: Joi.number().min(1).required(),
  keterangan: Joi.string().allow(""),
  namaKantor: Joi.string().allow(""),
  google: Joi.object({
    googleId: Joi.string().required(),
    etag: Joi.string().allow(""),
  }).required(),
})

module.exports = {
  createPartnerSchema,
  updatePartnerSchema,
}
