const Sequelize = require("sequelize")
const db = require("../config/database")

const token = db.define("googletoken", {
  syncToken: {
    type: Sequelize.STRING,
  },
})

module.exports = token
