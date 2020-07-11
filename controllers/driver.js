const {response,customError} = require('../helpers/wrapper')

// google contact helper
const {} = require('../helpers/googleContact')

// models
const Contact = require('../models/Contact')
const Driver = require('../models/Driver')

const getAllDriver = async (req,res,next) => {
    const driver = await Driver.findAll({
        include : [{
            model : Contact,
            attributes : {exclude : ['createdAt','updatedAt','deletedAt','raw']}
        }]
    })
    response(res,true,driver,'Data sopir berhasil didapatkan',200)
}

const createDriver = async (req,res,next) => {
    // get contact google
    // save googleId,raw,etag
    const driver = await Driver.create(req.body)
    response(res,true,driver,'Berhasil menambahkan data driver',200)
}

const getSpesificDriver = async (req,res,next) => {
    const driver = await Driver.findByPk(req.params.driverId)
    if (!driver) return next(customError('Data sopir tidak ditemukan',400))
    response(res,true,driver,'Berhasil mendapatkan data driver',200)
}

const updateDriver = async (req,res,next) => {
    const driver = await Driver.findByPk(req.params.driverId)
    if (!driver) return next(customError('Data sopir tidak ditemukan',400))
    const update = await driver.update(req.body)
    response(res,true,update,'Data sopir berhasil diupdate',200)
}

const deleteDriver = async (req,res,next) => {
    const driver = await Driver.findByPk(req.params.driverId)
    if (!driver) return next(customError('Data sopir tidak ditemukan',400))
    const delDriver =  await driver.destroy()
    response(res,true,delDriver,'Data sopir berhasil di hapus',200)
}

module.exports = {
    getAllDriver,
    createDriver,
    getSpesificDriver,
    updateDriver,
    deleteDriver
}