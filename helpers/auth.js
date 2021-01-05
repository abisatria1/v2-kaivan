const passport = require("passport")
const GoogleStrategy = require("passport-google-oauth2").Strategy
const refresh = require("passport-oauth2-refresh")
const dotenv = require("dotenv").config()
const Secret = require("../models/Secret")

const googlePassport = new GoogleStrategy(
  {
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.GOOGLE_CALLBACK_URL,
  },
  async (accessToken, refreshToken, profile, done) => {
    try {
      const all = await Secret.findAll({})
      for (let i = 0; i < all.length; i++) {
        await all[i].destroy()
      }
      if (
        profile.emails[0].value != "abi.kadek@gmail.com" &&
        profile.emails[0].value != "wddn07@gmail.com"
      ) {
        return done(null, null)
      }
      logger.debug({ accessToken, refreshToken, profile })
      logger.debug("assigning oauth client")
      const secret = await Secret.create({ accessToken, refreshToken })
      done(null, profile)
    } catch (error) {
      done(error, null)
    }
  }
)

passport.use(googlePassport)
refresh.use(googlePassport)
