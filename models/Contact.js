const Sequelize = require("sequelize")
const db = require("../config/database")

const contact = db.define(
  "contact",
  {
    googleId: {
      type: Sequelize.STRING,
      primaryKey: true,
      allowNull: false,
    },
    etag: {
      type: Sequelize.STRING,
    },
    nama: {
      type: Sequelize.STRING,
    },
    namaKantor: {
      type: Sequelize.STRING,
    },
    alamat: {
      type: Sequelize.STRING,
    },
    notelp: {
      type: Sequelize.STRING,
    },
    raw: {
      type: Sequelize.TEXT,
    },
  },
  {
    paranoid: true,
    // hooks : {
    //     beforeUpdate : (item,options) => {
    //         logger.debug('running after update hooks')
    //         console.log(item)
    //     }
    // }
  }
)

module.exports = contact
