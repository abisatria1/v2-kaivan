const Op = require("sequelize").Op

const dateBeetweenQuery = (tanggalAwal = "", tanggalAkhir = "") => {
  // creating query where
  if (tanggalAwal && tanggalAwal != "") {
    tanggalAwalQuery = [
      { tanggalOrder: { [Op.gte]: `${tanggalAwal} 00:00:00` } },
    ]
  }
  if (tanggalAkhir && tanggalAkhir != "") {
    tanggalAkhirQuery = [
      { tanggalOrder: { [Op.lte]: `${tanggalAkhir} 23:59:59` } },
    ]
  }
  return { tanggalAwalQuery, tanggalAkhirQuery }
}

module.exports = {
  dateBeetweenQuery,
}
