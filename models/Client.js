const Sequelize = require("sequelize")
const db = require("../config/database")

const Client = db.define("client", {
  ip_address: {
    type: Sequelize.STRING,
  },
  desc: {
    type: Sequelize.STRING,
  },
})

module.exports = Client
