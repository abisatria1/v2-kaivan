const Sequelize = require("sequelize")
const db = require("../config/database")

const Client = db.define("client", {
  ipAddress: {
    type: Sequelize.STRING,
  },
  campaignid: {
    type: Sequelize.STRING,
  },
  adgroupid: {
    type: Sequelize.STRING,
  },
  keyword: {
    type: Sequelize.STRING,
  },
  device: {
    type: Sequelize.STRING,
  },
  desc: {
    type: Sequelize.STRING,
  },
})

module.exports = Client
