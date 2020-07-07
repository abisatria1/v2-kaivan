const refresh = require('passport-oauth2-refresh');
const GoogleContacts = require('google-contacts-api')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// models
const Customer = require('../models/Customer');
const { google } = require('googleapis');

const hostName  = 'https://people.googleapis.com'
const personFields = 'personFields=names,addresses,phoneNumbers,organizations,biographies'
const sortOrder = 'sortOrder=LAST_MODIFIED_DESCENDING'

const getContact = async (service = google.people() , pageToken = "", syncToken = "") => {
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
                console.error('The Api return error ' + err)
                reject(err)
            }
            resolve(result.data)
        })
    })
}

const createGoogleContact = async (cust = {notelp : "", nama : "", alamat : "" , namaKantor : ""}, service = google.people()) => {
    let custData = {}
    if (cust.notelp != "" || cust.notelp || cust.notelp != null) {
        custData.phoneNumbers = [{value : cust.notelp}]
    }
    if (cust.nama != "" || cust.nama || cust.nama != null) {
        custData.names = [{givenName : cust.nama}]
    }
    if (cust.alamat != "" || cust.alamat || cust.alamat != null) {
        custData.addresses = [{streetAddress : cust.alamat}]
    }
    if (cust.namaKantor != "" || cust.namaKantor || cust.namaKantor != null) {
        custData.organizations = [{name : cust.namaKantor}]
    }

    custData.biographies = [{value : "Created from kaivan app"}]

    return new Promise(async (resolve,reject) => {
        try {
            const people = await service.people.createContact({
                requestBody : custData
            })
            resolve(people.data)
        } catch (err) {
            console.error('error happening in create api ' + err)
            reject(err)
        }
    })
}

const updateGoogleContact = async (prev = {googleId : "" , etag : ""},cust = {nama : "",alamat : "",notelp : "",namaKantor : ""}, service = google.people()) => {
    let custData = {}
    custData.etag = prev.etag
    if (cust.notelp != "" || cust.notelp || cust.notelp != null) {
        custData.phoneNumbers = [{value : cust.notelp}]
    }
    if (cust.nama != "" || cust.nama || cust.nama != null) {
        custData.names = [{givenName : cust.nama}]
    }
    if (cust.alamat != "" || cust.alamat || cust.alamat != null) {
        custData.addresses = [{streetAddress : cust.alamat}]
    }
    if (cust.namaKantor) {
        custData.organizations = [{name : cust.namaKantor}]
    }
    return new Promise(async (resolve,reject) => {
        try {
            const hasil = await service.people.updateContact({
                resourceName : prev.googleId,
                updatePersonFields : "names,addresses,phoneNumbers,organizations",
                requestBody : custData
            })
            resolve(hasil.data)
        } catch (err) {
            console.log('error happening in create api ' + err)
            console.log(err.response)
            reject(err)
        }
    })
}

const deleteGoogleContact = async (googleId = "", service = google.people()) => {
    return new Promise(async (resolve,reject) => {
        if (googleId == "") reject ( {type : false, message : "google id is empty"} )
        try {
            console.log('deleting google contact...')
            await service.people.deleteContact({
                resourceName : googleId
            })
            resolve({type : true, message : 'deleted'})
        } catch (err) {
            console.log('error happening in create api ' + err)
            console.log(err.response)
            reject(err)
        }
    })

}

const saveDatabaseFunc = async (dataCustomer = {}) => {
    console.log('saving to database function')
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

const updateDatabaseFunc = async (custDatabase = {}, dataCustomer = {}) => {
    console.log('update database data function')
    const etag = dataCustomer.etag
    const nama = dataCustomer.names ? dataCustomer.names[dataCustomer.names.length - 1].displayName : null
    const notelp = dataCustomer.phoneNumbers ? dataCustomer.phoneNumbers[0].canonicalForm : null
    const alamat = dataCustomer.addresses ? dataCustomer.addresses[dataCustomer.addresses.length - 1].formattedValue : null
    const namaKantor = dataCustomer.organizations ? dataCustomer.organizations[0].name : null

    const data = {etag,nama,notelp,alamat,namaKantor,raw : JSON.stringify(dataCustomer)}

    const customer = await custDatabase.update(data)
    return customer
}

const requestToGoogle = async (pageToken,syncToken,secret) => {
    let fixData = {}
    let queryparam = ''
    let syncparam = ''
    if (pageToken != undefined) queryparam = `&pageToken=${pageToken}`
    if (syncToken != undefined) syncparam = `&syncToken=${syncToken}`
    console.log(syncparam,queryparam)
    fixData = await axios({
        url : `${hostName}/v1/people/me/connections?${sortOrder}&pageSize=1000&${personFields}&requestSyncToken=true${queryparam}${syncparam}`,
        method : 'GET',
        headers : {
            'Authorization' : 'Bearer ' + secret.accessToken
        },
    })
    return fixData.data
}

const validateTypeSync = async (item) => {
    const {resourceName,names,addresses,phoneNumbers,biographies,organizations} = item
    const customer = await Customer.findOne({where : {googleId : resourceName}})
    if (!names && !addresses && !phoneNumbers && !biographies && !organizations) return {custDatabase : customer,type : "delete"}
    if (!customer) return {type : "create"}
    else return {custDatabase : customer,type : "update"}
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
        let createdData = 0, updatedData = 0,deletedData = 0
        for (let i = 0; i < arrSync.length; i++) {
            let {connections} = arrSync[i]
            if (!connections) break
            for (let i = 0; i < connections.length; i++) {
                let item = connections[i]
                let {custDatabase,type} = await validateTypeSync(item)
                try {
                    if (type == "delete") {
                        index++
                        deletedData++
                        console.log(`delete database base on sync data ${i}`)
                        if (custDatabase) await custDatabase.destroy()
                        else console.log(`data has been deleted on database : ${i}`)
                    }else if (type == "create") {
                        index++
                        createdData++
                        console.log(`create new contact with sync data ${i}`)
                        await saveDatabaseFunc(item)
                    }else if (type =="update") {
                        index++
                        updatedData++
                        console.log(`update database with sync data ${i}`)
                        await updateDatabaseFunc(custDatabase,item)
                    }else {
                        const error = new Error('Error type of object, expect "create", "delete" , "update" ')
                        reject(error)
                    }
                } catch (err) {
                    console.log(err)
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

module.exports = {
    getContact,
    updateGoogleContact,
    createGoogleContact,
    deleteGoogleContact,
    saveDatabaseFunc,
    requestToGoogle,
    saveSyncContact,
    createNewArr
}