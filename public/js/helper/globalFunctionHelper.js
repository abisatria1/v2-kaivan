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

const dateNowMysqlFormat = (jsDate) => {
  let date
  if (!jsDate) {
    date = moment(Date.now())
    date = date.format("YYYY-MM-DD")
    return date
  }
}

const formatDateToIndo = (date = "") => {
  if (date == "") return
  date = moment(date)
  const day = date.get("date")
  const year = date.get("year")
  const month = monthInIndonesia[date.get("month")]
  return `${day} ${month} ${year}`
}

const confirmMessage = async (title = "", text = "", icon = "") => {
  const swalWithBootstrapButtons = Swal.mixin({
    customClass: {
      cancelButton: "btn btn-danger p-2 w-25",
      confirmButton: "btn btn-success p-2 ml-4 w-25",
    },
    buttonsStyling: false,
  })

  const hasil = await swalWithBootstrapButtons.fire({
    title,
    text,
    icon,
    showCancelButton: true,
    confirmButtonText: "Yes",
    cancelButtonText: "No",
    reverseButtons: true,
  })
  return hasil.value
}

const errorMessage = async (title = "", text = "") => {
  Swal.fire({
    title,
    text,
    icon: "error",
    showConfirmButton: true,
    timer: 3000,
  })
}

const successMessage = async (title = "", text = "") => {
  Swal.fire({
    title,
    text,
    backdrop: false,
    showConfirmButton: false,
    icon: "success",
    timer: 2000,
    position: "top-end",
  })
}

const fromNumberToMoney = (number) => {
  if (number == "") return ""
  return number.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ".")
}

const fromMoneyToNumber = (money) => {
  if (money == "") return 0
  const newStr = money.split(".").join("")
  const num = parseInt(newStr)
  if (isNaN(num)) return 0
  else return num
}

const toMoney = (htmlElement) => {
  const value = fromMoneyToNumber(htmlElement.value)
  const money = fromNumberToMoney(value)
  htmlElement.value = money
}
