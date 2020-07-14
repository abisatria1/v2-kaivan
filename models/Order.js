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
            type : Sequelize.STRING
        },
        status : {
            type : Sequelize.INTEGER,
            allowNull : false,
            get() {
                let data = this.getDataValue('status')
                let string = ""
                switch (data) {
                    case 1:
                        string =  'Proses'
                        break
                    case 2: 
                        string =  'Diselesaikan'
                        break
                    case 3: 
                        string =  'Batal'
                        break
                    default:
                        break
                }
                return string
            }
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