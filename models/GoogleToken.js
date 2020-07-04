const Sequelize = require('sequelize')
const db = require('../config/database')

const token = db.define(
    'googleToken',
    {
        syncToken : {
            type : Sequelize.STRING
        }
    }
)

module.exports = token