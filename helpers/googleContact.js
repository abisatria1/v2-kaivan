const refresh = require('passport-oauth2-refresh');
const GoogleContacts = require('google-contacts-api')
const GoogleToken = require('../models/GoogleToken')
const Secret = require('../models/Secret')
const axios = require('axios')
const fs = require('fs')
const Op = require('sequelize').Op

// models
const Customer = require('../models/Customer')

const createGoogleContact = async (cust = {notelp : "", nama : "", alamat : ""}, secret) => {
    return new Promise(async (resolve,reject) => {
        try {
            const hasil = await axios({
                url : `https://people.googleapis.com/v1/people:createContact?personFields=names%2Caddresses%2CphoneNumbers&alt=json`,
                method : 'POST',
                headers : {
                    'Authorization' : 'Bearer ' + secret.accessToken
                },
                data : {
                    addresses : [
                        {
                            streetAddress : cust.alamat
                        }
                    ],
                    names : [
                        {
                            givenName : cust.nama
                        }
                    ],
                    phoneNumbers : [
                        {
                            value : cust.notelp
                        }
                    ]
                }
            })
            resolve(hasil.data)
        } catch (err) {
            console.log(err.response.data)
            reject(err)
        }
    })
}

const updateGoogleContact = async () => {
    return new Promise(async (resolve,reject) => {
        try {
            const hasil = await axios({
                url : `https://people.googleapis.com/v1/people:createContact?personFields=names%2Caddresses%2CphoneNumbers&alt=json`,
                method : 'POST',
                headers : {
                    'Authorization' : 'Bearer ' + secret.accessToken
                },
                data : {
                    addresses : [
                        {
                            streetAddress : cust.alamat
                        }
                    ],
                    names : [
                        {
                            givenName : cust.nama
                        }
                    ],
                    phoneNumbers : [
                        {
                            value : cust.notelp
                        }
                    ]
                }
            })
            resolve(hasil.data)
        } catch (err) {
            console.log(err.response.data)
            reject(err)
        }
    })
}

const deleteGoogleContact = async () => {
    // 
}

const saveDatabaseFunc = async (dataCustomer) => {
    console.log('saving to database function')
    const googleId = dataCustomer.resourceName
    const nama = dataCustomer.names ? dataCustomer.names[0].displayName : "tidak ada data"
    const notelp = dataCustomer.phoneNumbers ? dataCustomer.phoneNumbers[0].value : null
    const alamat = dataCustomer.addresses ? dataCustomer.addresses[0].formattedValue : null

    const data = {googleId,nama,notelp,alamat}

    const customer = await Customer.create(data)
    return customer
}

const requestToGoogle = async (pageToken,syncToken,secret) => {
    let fixData = {}
    let queryparam = ''
    let syncparam = ''
    if (pageToken != undefined) queryparam = `&pageToken=${pageToken}`
    if (syncToken != undefined) syncparam = `&syncToken=${syncToken}`
    console.log(queryparam)
    fixData = await axios({
        url : `https://content-people.googleapis.com/v1/people/me/connections?pageSize=1000&personFields=names%2Caddresses%2CphoneNumbers&requestSyncToken=true${queryparam}${syncparam}`,
        method : 'GET',
        headers : {
            'Authorization' : 'Bearer ' + secret.accessToken
        },
    })
    return fixData.data
}

module.exports = {
    updateGoogleContact,
    createGoogleContact,
    deleteGoogleContact,
    saveDatabaseFunc,
    requestToGoogle
}