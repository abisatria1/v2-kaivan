const Sequelize = require('sequelize')
const db = require('../config/database')

const Customer = db.define(
    'customer',
    {
        googleId : {
            type : Sequelize.STRING
        },
        nama : {
            type : Sequelize.STRING,
            allowNull : false
        },
        alamat : {
            type : Sequelize.STRING,
        },
        notelp : {
            type : Sequelize.STRING,
        }
    },
    {
        paranoid : true
    }
)

module.exports = Customer