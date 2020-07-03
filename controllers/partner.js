const {response,customError} = require('../helpers/wrapper')
 // models
const Partner = require('../models/Partner')

const getAllPartner = async (req,res,next) => {
    const partner = await Partner.findAll({})
    response(res,true,partner,'Data jasa berhasil didapatkan',200)
}

const createPartner = async (req,res,next) => {
    const partner = await Partner.create(req.body)
    response(res,true,partner,'Berhasil menambahkan data jasa',200)
}

const getSpesificPartner = async (req,res,next) => {
    const partner = await Partner.findByPk(req.params.partnerId)
    if (!partner) return next(customError('Data jasa tidak ditemukan',400))
    response(res,true,partner,'Berhasil mendapatkan data jasa',200)
}

const updatePartner = async (req,res,next) => {
    const partner = await Partner.findByPk(req.params.partnerId)
    if (!partner) return next(customError('Data jasa tidak ditemukan',400))
    const update = await partner.update(req.body)
    response(res,true,update,'Data jasa berhasil diupdate',200)
}

const deletePartner = async (req,res,next) => {
    const partner = await Partner.findByPk(req.params.partnerId)
    if (!partner) return next(customError('Data jasa tidak ditemukan',400))
    const delPartner =  await partner.destroy()
    response(res,true,delPartner,'Data jasa berhasil di hapus',200)
}

module.exports = {
    getAllPartner,
    createPartner,
    getSpesificPartner,
    updatePartner,
    deletePartner
}