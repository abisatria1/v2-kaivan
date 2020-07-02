const Sequelize = require('sequelize')
const db = require('../config/database')

const Partner = db.define(
    'partner',
    {
        nama : {
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
        norek : {
            type : Sequelize.STRING
        },
        statusJasa : {
            type : Sequelize.STRING,
            defaultValue : 'Aktif'
        },
        tipePembayaran : {
            type : Sequelize.INTEGER,
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

module.exports = Partner