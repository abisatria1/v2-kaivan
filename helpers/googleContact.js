const refresh = require('passport-oauth2-refresh')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// models
const Customer = require('../models/Customer')
const Contact = require('../models/Contact')
const { google } = require('googleapis')

const hostName  = 'https://people.googleapis.com'
const personFields = 'personFields=names,addresses,phoneNumbers,organizations,biographies'
const sortOrder = 'sortOrder=LAST_MODIFIED_DESCENDING'

const getContact = async ({service = google.people('v1') , pageToken = "", syncToken = ""}) => {
    return new Promise((resolve,reject) => {
        service.people.connections.list({
            resourceName : 'people/me',
            personFields : 'names,organizations,addresses,phoneNumbers,metadata,biographies,photos,memberships',
            pageSize : 1000,
            requestSyncToken : true,
            sortOrder : 'LAST_MODIFIED_DESCENDING',
            pageToken,
            syncToken
        }, (err,result) => {
            if (err){
                logger.error('The Api return error ' + err)
                reject(err)
            }
            resolve(result.data)
        })
    })
}

const createGoogleContact = async (contact = {notelp : "", nama : "", alamat : "" , namaKantor : ""}, service = google.people('v1')) => {
    let contactData = {}
    if (contact.notelp != "" || contact.notelp || contact.notelp != null) {
        contactData.phoneNumbers = [{value : contact.notelp}]
    }
    if (contact.nama != "" || contact.nama || contact.nama != null) {
        contactData.names = [{givenName : contact.nama}]
    }
    if (contact.alamat != "" || contact.alamat || contact.alamat != null) {
        contactData.addresses = [{streetAddress : contact.alamat}]
    }
    if (contact.namaKantor != "" || contact.namaKantor || contact.namaKantor != null) {
        contactData.organizations = [{name : contact.namaKantor}]
    }

    contactData.biographies = [{value : "Created from kaivan app"}]

    return new Promise(async (resolve,reject) => {
        try {
            const people = await service.people.createContact({
                requestBody : contactData
            })
            resolve(people.data)
        } catch (err) {
            logger.error('error happening in create api ' + err)
            reject(err)
        }
    })
}

const updateGoogleContact = async (prev = {googleId : "" , etag : ""},contact = {nama : "",alamat : "",notelp : "",namaKantor : ""}, service = google.people('v1')) => {
    let contactData = {}
    contactData.etag = prev.etag
    if (contact.notelp != "" || contact.notelp || contact.notelp != null) {
        contactData.phoneNumbers = [{value : contact.notelp}]
    }
    if (contact.nama != "" || contact.nama || contact.nama != null) {
        contactData.names = [{givenName : contact.nama}]
    }
    if (contact.alamat != "" || contact.alamat || contact.alamat != null) {
        contactData.addresses = [{streetAddress : contact.alamat}]
    }
    if (contact.namaKantor) {
        contactData.organizations = [{name : contact.namaKantor}]
    }
    return new Promise(async (resolve,reject) => {
        try {
            const hasil = await service.people.updateContact({
                resourceName : prev.googleId,
                updatePersonFields : "names,addresses,phoneNumbers,organizations",
                requestBody : contactData
            })
            resolve(hasil.data)
        } catch (err) {
            logger.error('error happening in create api ' + err)
            logger.error(err.response)
            reject(err)
        }
    })
}

const deleteGoogleContact = async (googleId = "", service = google.people('v1')) => {
    return new Promise(async (resolve,reject) => {
        if (googleId == "") reject ( {type : false, message : "google id is empty"} )
        try {
            logger.debug('deleting google contact...')
            await service.people.deleteContact({
                resourceName : googleId
            })
            resolve({type : true, message : 'deleted'})
        } catch (err) {
            logger.error('error happening in create api ' + err)
            logger.error(err.response)
            reject(err)
        }
    })

}

const saveDatabaseFunc = async (dataCustomer = {}) => {
    logger.debug('saving to database function')
    const googleId = dataCustomer.resourceName
    const etag = dataCustomer.etag
    const nama = dataCustomer.names ? dataCustomer.names[dataCustomer.names.length - 1].displayName : null
    const notelp = dataCustomer.phoneNumbers ? dataCustomer.phoneNumbers[0].canonicalForm : null
    const alamat = dataCustomer.addresses ? dataCustomer.addresses[dataCustomer.addresses.length - 1].formattedValue : null
    const namaKantor = dataCustomer.organizations ? dataCustomer.organizations[0].name : null

    const data = {googleId,etag,nama,notelp,alamat,namaKantor,raw : JSON.stringify(dataCustomer)}

    const customer = await Customer.create(data)
    return customer
}

const createNewArr = async (data = []) => {
    let resArr = []
    resArr = data.map(row => {
        return row.connections.map(item => {
            let googleId = item.resourceName
            let etag = item.etag
            let nama = item.names ? item.names[item.names.length - 1].displayName : null
            let notelp = item.phoneNumbers ? item.phoneNumbers[0].canonicalForm : null
            let alamat = item.addresses ? item.addresses[item.addresses.length - 1].formattedValue : null
            let namaKantor = item.organizations ? item.organizations[0].name : null

            let data = {googleId,etag,nama,notelp,alamat,namaKantor,raw : JSON.stringify(item)}
            return data
        })
    })
    return resArr
}

const validateTypeSync = async (item) => {
    const {resourceName,names,addresses,phoneNumbers,biographies,organizations} = item
    const contact = await Contact.findOne({where : {googleId : resourceName}})
    if (!names && !addresses && !phoneNumbers && !biographies && !organizations) return {custDatabase : contact,type : "delete"}
    if (!contact) return {type : "create"}
    else return {custDatabase : contact,type : "update"}
}

/* 
arrsync = 
[
    {connections : []},
    {connections : []},
    {connections : []},
    {connections : []},
]
*/
const saveSyncContact = async (arrSync = []) => {
    return new Promise(async (resolve,reject) => {
        let index = 0
        let createdData = [], updatedData = [],deletedData = []
        for (let i = 0; i < arrSync.length; i++) {
            let {connections} = arrSync[i]
            if (!connections) break
            for (let i = 0; i < connections.length; i++) {
                let item = connections[i]
                let {custDatabase,type} = await validateTypeSync(item)
                try {
                    if (type == "delete") {
                        index++
                        deletedData.push(item)
                        logger.debug(`delete database base on sync data ${i}`)
                        if (custDatabase) return
                        // if (custDatabase) await custDatabase.destroy()
                        else logger.debug(`data has been deleted on database : ${i}`)
                    }else if (type == "create") {
                        index++
                        createdData.push(item)
                        logger.debug(`pushing new contact with sync data ${i}`)
                        // await saveDatabaseFunc(item)
                    }else if (type =="update") {
                        index++
                        updatedData.push(item)
                        logger.debug(`pushing new contact with sync data ${i}`)
                        // await updateDatabaseFunc(custDatabase,item)
                    }else {
                        const error = new Error('Error type of object, expect "create", "delete" , "update" ')
                        reject(error)
                    }
                } catch (err) {
                    logger.error(err)
                    reject(err)
                }
            }
        }
        resolve({
            type : "success", 
            message : `${index} data has been sync with database`,
            data : {createdData,updatedData,deletedData}
        })
    })
}

const createSyncArr = async (data = []) => {
    let resArr = []
    resArr = data.map(item => {
        let googleId = item.resourceName
        let etag = item.etag
        let nama = item.names ? item.names[item.names.length - 1].displayName : null
        let notelp = item.phoneNumbers ? item.phoneNumbers[0].canonicalForm : null
        let alamat = item.addresses ? item.addresses[item.addresses.length - 1].formattedValue : null
        let namaKantor = item.organizations ? item.organizations[0].name : null

        let data = {googleId,etag,nama,notelp,alamat,namaKantor,raw : JSON.stringify(item)}
        return data
    })
    return resArr
}

module.exports = {
    getContact,
    updateGoogleContact,
    createGoogleContact,
    deleteGoogleContact,
    saveDatabaseFunc,
    saveSyncContact,
    createNewArr,
    createSyncArr
}