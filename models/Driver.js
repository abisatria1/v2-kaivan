const Sequelize = require('sequelize')
const db = require('../config/database')

const Driver = db.define(
    'driver',
    {
        kodeSopir : {
            type : Sequelize.STRING,
            allowNull : false
        },
        keterangan : {
            type : Sequelize.STRING
        }
    },
    {
        paranoid : true
    }
)

module.exports = Driver