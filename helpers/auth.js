const passport = require('passport')
const GoogleStrategy = require('passport-google-oauth2').Strategy
const refresh = require('passport-oauth2-refresh')
const dotenv = require('dotenv').config()
const Secret = require('../models/Secret')


const googlePassport = new GoogleStrategy({
    clientID : process.env.GOOGLE_CLIENT_ID,
    clientSecret : process.env.GOOGLE_CLIENT_SECRET,
    callbackURL : 'http://localhost:3001/api/customer/google',
},async (accessToken,refreshToken,profile,done) => {
    const all = await Secret.findAll({})
    for (let i = 0; i < all.length; i++) {
        await all[i].destroy()
    }
    const secret= await Secret.create({accessToken,refreshToken})
    done(null,profile)
})

passport.use(googlePassport)
refresh.use(googlePassport)