const {response,customError} = require('../helpers/wrapper')
const refresh = require('passport-oauth2-refresh');
const GoogleContacts = require('google-contacts-api')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// contact helper
const {
    saveDatabaseFunc,
    requestToGoogle,
    createGoogleContact,
    updateGoogleContact,
    saveSyncContact,
    deleteGoogleContact
} = require('../helpers/googleContact')

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
    if (!customer) return next(customError('Data pelanggan tidak ada',400))
    response(res,true,customer,'Berhasil mendapatkan data pelanggan',200)
}

const createCustomer = async (req,res,next) => {
    let secret = await Secret.findAll({})
    secret = secret[0]
    let contact
    try {
        contact = await createGoogleContact(req.body,secret)

        req.body.googleId = contact.resourceName
        req.body.etag = contact.etag
        req.body.raw = JSON.stringify(contact)
        req.body.notelp = contact.phoneNumbers[0].canonicalForm
        const customer = await Customer.create(req.body)
        response(res,true,{customer, googleContact : contact},'Customer berhasil dibuat',201)
    } catch (err) {
        console.log("error happen " + err)        
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('get data with new token')
            refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    return err
                }
                await secret.update({accessToken})
                contact = await createGoogleContact(req.body,{accessToken})
                req.body.googleId = contact.resourceName
                req.body.etag = contact.etag
                req.body.raw = JSON.stringify(contact)
                req.body.notelp = contact.phoneNumbers[0].canonicalForm
                const customer = await Customer.create(req.body)
                response(res,true,{customer, googleContact : contact},'Customer berhasil dibuat',201)
            })
        }else {
            return next(customError('gagal internal server error',500))
        }
    }
}

const updateCustomer = async (req,res,next) => {
    const customer = await Customer.findByPk(req.params.customerId)
    if (!customer) return next(customError('Tidak ada data pelanggan',400))
    let secret = await Secret.findAll({})
    secret = secret[0]
    // update customer contact google
    let update
    try {
        update = await updateGoogleContact(customer,req.body,secret)

        req.body.etag = update.etag
        req.body.raw = JSON.stringify(update)
        req.body.notelp = update.phoneNumbers[0].canonicalForm
        await customer.update(req.body)
        const result = await Customer.findByPk(customer.id)
        response(res,true,{result,googleContact : update},'Customer berhasil diupdate',200)
    } catch (err) {
        console.log("error happen " + err)        
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('get data with new token')
            refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    throw err
                }
                await secret.update({accessToken})
                update = await updateGoogleContact(customer,req.body,{accessToken})

                req.body.etag = update.etag
                req.body.raw = JSON.stringify(update)
                req.body.notelp = update.phoneNumbers[0].canonicalForm
                await customer.update(req.body)
                const result = await Customer.findByPk(customer.id)
                response(res,true,{result,googleContact : update},'Customer berhasil diupdate',200)
            })
        }else {
            return next(customError('gagal internal server error',500))
        }
    }
}

const deleteCustomer = async (req,res,next) => {
    const customer = await Customer.findByPk(req.params.customerId)
    if (!customer) return next(customError('Data pelanggan tidak ditemukan',400))
    await customer.destroy()
    let secret = await Secret.findAll({})
    secret = secret[0]
    try {
        const delCustomer = await deleteGoogleContact(customer.googleId,secret)
        if (delCustomer.type == false) throw delCustomer 
        response(res,true,{},'Pelanggan berhasil dihapus',200)
    } catch (err) {
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('delete data with new token')
            refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    return err
                }
                await deleteGoogleContact(customer.googleId,secret)
                await secret.update({accessToken})
                response(res,true,{},'Pelanggan berhasil dihapus',200)
            })
        }else {
            console.log(err)
            return next(customError('gagal internal server error',500))
        }
    }
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
        let hasil = await requestToGoogle(undefined,googleToken.syncToken,secret)
        await googleToken.update({syncToken : hasil.nextSyncToken})

        let syncDb = {}
        syncDb = await saveSyncContact(hasil.connections)
        response(res,true,{syncDb, googleSync : hasil},'Berhasil mensinkronisasikan data',200)
    } catch (err) {       
        if (err.response.data.error.status == 'UNAUTHENTICATED') {
            console.log('get data with new token')
            refresh.requestNewAccessToken('google', secret.refreshToken, async (err, accessToken, refreshToken) => {
                if (err) {
                    console.log(err)
                    return err
                }
                hasil2 = await requestToGoogle(undefined,googleToken.syncToken,{accessToken})
                await googleToken.update({syncToken : hasil2.nextSyncToken})
                await secret.update({accessToken})
                
                let syncDb = {}
                syncDb = await saveSyncContact(hasil2.connections)
                response(res,true,{syncDb, googleSync : hasil2},'Berhasil mensinkronisasikan data',200)
            })
        }else {
            console.log(err) 
            next(customError('error internal system in sync method',500))
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