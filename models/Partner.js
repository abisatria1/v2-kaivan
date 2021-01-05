const Sequelize = require("sequelize")
const db = require("../config/database")

const Partner = db.define(
  "partner",
  {
    norek: {
      type: Sequelize.STRING,
    },
    statusJasa: {
      type: Sequelize.STRING,
      defaultValue: "Aktif",
    },
    tipePembayaran: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    keterangan: {
      type: Sequelize.STRING,
    },
  },
  {
    paranoid: true,
  }
)

module.exports = Partner
