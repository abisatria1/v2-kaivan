const Sequelize = require('sequelize')
const db = require('../config/database')

const Customer = db.define(
    'customer',
    {
        nama : {
            type : Sequelize.STRING,
            allowNull : false
        },
        alamat : {
            type : Sequelize.STRING,
            allowNull : false
        },
        notelp : {
            type : Sequelize.STRING,
            allowNull : false
        }
    },
    {
        paranoid : true
    }
)

module.exports = Customer