const Sequelize = require('sequelize')
const db = require('../config/database')

const Payment = db.define(
    'payment',
    {
        jumlahBayar : {
            type : Sequelize.INTEGER,
            allowNull : false
        }
    },
    {
        paranoid : true
    }
)

module.exports = Payment