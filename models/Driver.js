const Sequelize = require('sequelize')
const db = require('../config/database')

const Driver = db.define(
    'driver',
    {
        nama : {
            type : Sequelize.STRING,
            allowNull : false
        },
        kodeSopir : {
            type : Sequelize.STRING,
            allowNull : false
        },
        notelp : {
            type : Sequelize.STRING,
            allowNull : false
        },
        alamat : {
            type : Sequelize.STRING
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