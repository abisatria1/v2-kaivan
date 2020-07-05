const Sequelize = require('sequelize')
const db = require('../config/database')

const Customer = db.define(
    'customer',
    {
        googleId : {
            type : Sequelize.STRING
        },
        etag : {
            type : Sequelize.STRING
        },
        nama : {
            type : Sequelize.STRING,
        },
        namaKantor : {
            type : Sequelize.STRING
        },
        alamat : {
            type : Sequelize.STRING,
        },
        notelp : {
            type : Sequelize.STRING,
        },
        raw : {
            type : Sequelize.TEXT
        }
    },
    {
        paranoid : true
    }
)

module.exports = Customer