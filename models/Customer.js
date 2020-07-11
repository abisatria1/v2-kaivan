const Sequelize = require('sequelize')
const db = require('../config/database')

const Customer = db.define(
    'customer',
    {
        keterangan : {
            type : Sequelize.STRING
        }
    },
    {
        paranoid : true
    }
)

module.exports = Customer