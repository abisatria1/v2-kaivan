const monthInIndonesia = [
  "Januari",
  "Februari",
  "Maret",
  "April",
  "Mei",
  "Juni",
  "Juli",
  "Agustus",
  "September",
  "Oktober",
  "November",
  "Desember",
]
// from 2021-01-31 to 31 Januari 2021
formatMysqlDateToString = (tanggal) => {
  const date = moment(tanggal)
  return date.format("D MMM YY")
}

const formatDateToIndo = (date = "") => {
  if (date == "") return
  const tanggal = new Date(date)
  const year = tanggal.getFullYear()
  const day = tanggal.getDate()
  const month = monthInIndonesia[tanggal.getMonth()]
  return `${day} ${month} ${year}`
}
