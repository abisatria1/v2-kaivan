const {response,customError} = require('../helpers/wrapper')
const refresh = require('passport-oauth2-refresh');
const GoogleContacts = require('google-contacts-api')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// contact helper
const {saveDatabaseFunc,requestToGoogle,createGoogleContact} = require('../helpers/googleContact')

// models
const Customer = require('../models/Customer')

const getAllCustomer = async (req,res,next) => {
    const customer = await Customer.findAll({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt']}
    })
    response(res,true,customer,'Semua data pelanggan berhasil di dapatkan',200)
}

const getSpesificCustomer = async (req,res,next) => {
    const customer = await Customer.findByPk(req.params.customerId)
    if (!customer) return response(res,false,'','Data pelanggan tidak ada',400)
    response(res,true,customer,'Berhasil mendapatkan data pelanggan',200)
}

const createCustomer = async (req,res,next) => {
    let secret = await Secret.findByPk(4)
    try {
        const contact = await createGoogleContact(req.body,secret)
        req.body.googleId = contact.resourceName
        const customer = await Customer.create(req.body)
        response(res,true,customer,'Customer berhasil dibuat',201)
    } catch (err) {
        console.log(err)        
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('get data with new token')
            const hasil2 = refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    return err
                }
                await secret.update({accessToken})
                return await createGoogleContact(req.body,{accessToken})
            })
        }else {
            return next(customError('gagal internal server error',500))
        }
    }
}

const updateCustomer = async (req,res,next) => {
    // harus ada raw metadata dari google
}

const deleteCustomer = async (req,res,next) => {
    // 
}

/* 
param dapat berupa :
1. nama
2. alamat
3. notelp
*/
const searchByParam = async (req,res,next) => {
    const {param} = req.params
    const {value} = req.query
    let query
    if (value == "" || value == null || !value) return next(customError('query "value" dibutuhkan',400))
    switch (param) {
        case "nama":
            console.log('helo')
            query = {nama : {[Op.like] : `%${value}%`}}
            break
        case "alamat": 
            query = {alamat : {[Op.like] : `%${value}%`}}
            break
        case "notelp": 
            query = {notelp : {[Op.like] : `%${value}%`}}
            break
        default:
            break
    }
    console.log(query)
    if (!query) return next(customError('param tidak valid',400))
    const customer = await Customer.findAll({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
        where : query
    })
    response(res,true,customer,'Berhasil mendapatkan data pelanggan',200)
}

const successAuth = async (req,res,next) => {
    response(res,true,{},'Berhasil melakukan authentikasi',200)
}

// contact middleware
const getAllContact = async (req,res,next) => {
    let secret  =await Secret.findAll({})
    secret = secret[0]
    refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
        if (err) {
            console.log(err)
            return err
        }
        console.log(accessToken)
        await secret.update({accessToken})
        secret = await Secret.findAll({})
        secret = secret[0]
        let arrContact = []
        let syncToken = undefined
        let googleToken
        for (let i = 0; i < 20; i++) {
            if (i==0) pageToken = undefined
            else pageToken = arrContact[i-1].nextPageToken
            console.log("pageToken = " + pageToken)
            console.log("fetching " + i)
            try {
                let hasil = await requestToGoogle(pageToken,syncToken,secret)
                // mendapatkan syncToken
                if (hasil.syncToken) {
                    googleToken = await GoogleToken.findByPk(1)
                    if (!googleToken) await GoogleToken.create({syncToken : hasil.syncToken})
                    else await googleToken.update({syncToken : hasil.syncToken})
                }else if (hasil.nextSyncToken) {
                    googleToken = await GoogleToken.findByPk(1)
                    if (!googleToken) await GoogleToken.create({syncToken : hasil.nextSyncToken})
                    else await googleToken.update({syncToken : hasil.nextSyncToken})
                }
                arrContact.push(hasil)
            } catch (error) {
                console.log('errorr pada request to google')
                console.log(error)
            }
        }
        console.log('done')
        response(res,true,arrContact,'berhasil',200)
    })
}

const syncContact = async (req,res,next) => {
    const googleToken = await GoogleToken.findByPk(1)
    let secret  = await Secret.findAll({})
    secret = secret[0]
    if (!googleToken.syncToken) return next(customError('sync token tidak ada',400))
    try {
        const hasil = await requestToGoogle(undefined,googleToken.syncToken,secret)
        await googleToken.update({syncToken : hasil.nextSyncToken})
        response(res,true,hasil,'Berhasil mendapatkan data yang terbaru',200)
    } catch (err) {
        console.log(err)        
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('get data with new token')
            refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    return err
                }
                const hasil2 = await requestToGoogle(undefined,googleToken.syncToken,{accessToken})
                await secret.update({accessToken})
                response(res,true,hasil2,'Berhasil mendapatkan data yang terbaru',200)
            })
        }else {
            return next(customError('gagal',400))
        }
    }
}

const saveContactToDatabase = async (req,res,next) => {
    console.log('get json data')
    let customerDataToDatabase = JSON.parse(fs.readFileSync('dataPhone.json', 'utf8'));
    customerDataToDatabase = customerDataToDatabase.data
    let index = 1
    console.log(customerDataToDatabase)
    for (let i = 0; i < customerDataToDatabase.length; i++) {
        console.log('inserting....')
        let connections = customerDataToDatabase[i].connections
        for (let j = 0; j < connections.length; j++) {
            let item = connections[j]
            let hasil = await saveDatabaseFunc(item)            
            console.log('berhasil masukan database ' + index)
            index++
        }
    }
    response(res,true,{},`Berhasil memasukan ${index-1} data`,201)
}





module.exports = {
    getAllCustomer,
    getSpesificCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAllContact,
    successAuth,
    syncContact,
    saveContactToDatabase,
    searchByParam
}