const Sequelize = require('sequelize')
const db = require('../config/database')

const Order = db.define(
    'order',
    {
        jumlah : {
            type : Sequelize.INTEGER,
            allowNull : false
        },
        jam : {
            type : Sequelize.TIME
        },
        status : {
            type : Sequelize.INTEGER,
            allowNull : false
        },
        keterangan : {
            type : Sequelize.STRING
        },
        harga : {
            type : Sequelize.INTEGER
        },
        isPay : {
            type : Sequelize.INTEGER,
            defaultValue : 0
        },
        isCheck : {
            type : Sequelize.INTEGER,
            defaultValue : 0
        },
        tanggalCheck : {
            type : Sequelize.DATE
        },
        tanggalOrder : {
            type : Sequelize.DATE,
            allowNull : false
        }
    },
    {
        paranoid : true,
        hooks : {
            afterDestroy: async (order, options) => {
                const result = await order.getDrivers()
                for (let i = 0; i < result.length; i++) {
                    await result[i].order_driver.destroy()
                }
            }
        }
    }
)

module.exports = Order