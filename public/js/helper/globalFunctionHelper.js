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
    date = new Date(Date.now())
  }
  const year = date.getFullYear()
  const month = date.getMonth() + 1
  const day = date.getDate()
  return `${year}-${month}-${day}`
}

const formatDateToIndo = (date = "") => {
  if (date == "") return
  const tanggal = new Date(date)
  const year = tanggal.getFullYear()
  const day = tanggal.getDate()
  const month = monthInIndonesia[tanggal.getMonth()]
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
