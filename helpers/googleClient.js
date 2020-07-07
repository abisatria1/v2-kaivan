const dotenv = require('dotenv').config()
const {google} = require('googleapis')
const Secret = require('../models/Secret')
const { response } = require('./wrapper')

const setGoogleClient = () => {
    return async (req,res,next) => {
        let secret = await Secret.findAll({})
        if (!secret.length) return response(res,false,null,"secret is empty",500)
        secret = secret[0]
        access_token = secret.accessToken
        refresh_token = secret.refreshToken
        // make google client
        const oAuth2Client = new google.auth.OAuth2(process.env.GOOGLE_CLIENT_ID,process.env.GOOGLE_CLIENT_SECRET)
        oAuth2Client.setCredentials({refresh_token})
        req.oAuth2Client = oAuth2Client
        next()
    }
}

module.exports = {
    setGoogleClient
}