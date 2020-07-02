const {response,customError} = require('../helpers/wrapper')
const {google} = require('googleapis')
const GoogleContacts = require('google-contacts-api')
const Secret = require('../models/Secret')

// models
const Customer = require('../models/Customer')
const axios = require('axios')

const getAllCustomer = async (req,res,next) => {
    const customer = await Customer.findAll({})
    response(res,true,customer,'Semua data pelanggan berhasil di dapatkan',200)
}

const getSpesificCustomer = async (req,res,next) => {
    // 
}

const getAllContact = async (req,res,next) => {
    let secret  =await Secret.findAll({})
    secret = secret[0]
    axios({
        url : 'https://content-people.googleapis.com/v1/people/me/connections?personFields=names%2Caddresses%2CphoneNumbers',
        method : 'GET',
        headers : {
            'Authorization' : 'Bearer ' + secret.accessToken
        },
    })
    .then(data=> {
        return response(res,true,data.data,'berhasil',200)
    })
    .catch(err => {
        console.log(err)
        return response(res,false,err,'gagal',400)
    })
}

const createCustomer = async (req,res,next) => {
    const customer = await Customer.create(req.body)
    // tambahkan data ke contact google
    response(res,true,customer,'Customer berhasil dibuat',201)
}


const updateCustomer = async (req,res,next) => {
    // 
}

const deleteCustomer = async (req,res,next) => {
    // 
}

const successAuth = async (req,res,next) => {
    response(res,true,{},'Berhasil melakukan authentikasi',200)
}


module.exports = {
    getAllCustomer,
    getSpesificCustomer,
    createCustomer,
    updateCustomer,
    deleteCustomer,
    getAllContact,
    successAuth
}