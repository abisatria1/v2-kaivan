const Sequelize = require("sequelize")
const db = require("../config/database")

const secret = db.define("secret", {
  accessToken: {
    type: Sequelize.STRING,
  },
  refreshToken: {
    type: Sequelize.STRING,
  },
})

module.exports = secret
