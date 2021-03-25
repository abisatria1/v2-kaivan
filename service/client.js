const Client = require("../models/Client")
const Op = require("sequelize").Op

const create = async (data) => {
  const client = await Client.create(data)
  return client
}

const getData = async (tanggalAwal, tanggalAkhir = tanggalAwal) => {
  const clients = await Client.findAll({
    where: {
      [Op.and]: [
        { createdAt: { [Op.gte]: `${tanggalAwal} 00:00:00` } },
        { createdAt: { [Op.lte]: `${tanggalAkhir} 23:59:59` } },
      ],
    },
  })
  return clients
}

module.exports = {
  create,
  getData,
}
