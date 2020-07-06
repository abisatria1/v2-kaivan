const refresh = require('passport-oauth2-refresh');
const GoogleContacts = require('google-contacts-api')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// models
const Customer = require('../models/Customer');
const { hostname } = require('os');
const { response } = require('express');

const hostName  = 'https://people.googleapis.com'
const personFields = 'personFields=names,addresses,phoneNumbers,organizations,biographies'
const sortOrder = 'sortOrder=LAST_MODIFIED_DESCENDING'

const createGoogleContact = async (cust = {notelp : "", nama : "", alamat : "" , namaKantor : ""}, secret) => {
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
            const hasil = await axios({
                url : `${hostName}/v1/people:createContact?${personFields}&alt=json`,
                method : 'POST',
                headers : {
                    'Authorization' : 'Bearer ' + secret.accessToken
                },
                data : custData
            })
            resolve(hasil.data)
        } catch (err) {
            console.log(err)
            reject(err)
        }
    })
}

const updateGoogleContact = async (prev = {googleId : "" , etag : ""},cust = {nama : "",alamat : "",notelp : "",namaKantor : ""}, secret) => {
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
    const updatePersonFields = `updatePersonFields=names,addresses,phoneNumbers,organizations`
    return new Promise(async (resolve,reject) => {
        try {
            const hasil = await axios({
                url : `${hostName}/v1/${prev.googleId}:updateContact?${sortOrder}&${personFields}&${updatePersonFields}`,
                method : 'PATCH',
                headers : {
                    'Authorization' : 'Bearer ' + secret.accessToken
                },
                data : custData
            })
            resolve(hasil.data)
        } catch (err) {
            console.log(err.response.data)
            reject(err)
        }
    })
}

const deleteGoogleContact = async (googleId = "", secret = {}) => {
    if (googleId == "") return {type : false, message : "google id is empty"}
    return new Promise(async (resolve,reject) => {
        try {
            console.log('deleting google contact...')
            await axios({
                url : `${hostName}/v1/${googleId}:deleteContact`,
                method : 'DELETE',
                headers : {
                    'Authorization' : 'Bearer ' + secret.accessToken
                }
            })
            resolve({type : true, message : 'deleted'})
        } catch (err) {
            console.log(err.response.data)
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

const saveSyncContact = async (arrSync = []) => {
    return new Promise(async (resolve,reject) => {
        let index = 0
        for (let i = 0; i < arrSync.length; i++) {
            let item = arrSync[i]
            let {custDatabase,type} = await validateTypeSync(item)
            try {
                if (type == "delete") {
                    index++
                    console.log(`delete database base on sync data ${i}`)
                    if (custDatabase) await custDatabase.destroy()
                    else console.log(`data has been deleted on database : ${i}`)
                }else if (type == "create") {
                    index++
                    console.log(`create new contact with sync data ${i}`)
                    await saveDatabaseFunc(item)
                }else if (type =="update") {
                    index++
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
        resolve({type : "success", message : `${index} data has been sync with database`})
    })
}

module.exports = {
    updateGoogleContact,
    createGoogleContact,
    deleteGoogleContact,
    saveDatabaseFunc,
    requestToGoogle,
    saveSyncContact,
    createNewArr
}