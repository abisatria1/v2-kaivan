// state
const setState = async (driverCode = "") => {
  try {
    const result = await loadSpesificSopir(driverCode)
    if (!result.data) throw new Error("Driver not found")
    dataSopir = result.data
    prevSopir = { ...result.data }
    elm.datePicker = defineDateRangePicker("tanggal")
    elm.orderTable = defineDatatables()
  } catch (err) {
    await Swal.fire({
      icon: "error",
      title: "Internal Error",
      text: err.data ? err.data.message : err.message,
      showConfirmButton: true,
      timer: 3000,
    })
    window.location.href = "/sopir"
  }
}

const isiForm = (data = dataSopir) => {
  $(".pageTitle").text(data.contact.nama)
  $(".titleDesc").text(data.kodeSopir)
  $("#idSopir").val(data.id)
  $("#namaSopir").val(data.contact.nama)
  $("#notelpSopir").val(data.contact.notelp)
  $("#alamatSopir").val(data.contact.alamat)
  $("#kodeSopir").val(data.kodeSopir)
  $("#keteranganSopir").val(data.keterangan)
}

const doUpdate = async (id, data) => {
  try {
    await updateSopir(id, data)

    if (dataSopir.kodeSopir != prevSopir.kodeSopir) {
      await popUpMessage({
        title: "Perubahan berhasil disimpan",
      })
      return (window.location.href = `/sopir/detail/${dataSopir.kodeSopir}`)
    }
    popUpMessage({
      title: "Perubahan berhasil disimpan",
    })

    return isiForm()
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Data tidak valid",
      text: err.data ? err.data.message : err.message,
      showConfirmButton: true,
      timer: 3000,
    })
  }
}

const drawOrderTableByOption = async (kodeSopir, tanggalAwal, tanggalAkhir) => {
  try {
    const { data } = await getAllDriverOrder(
      kodeSopir,
      tanggalAwal,
      tanggalAkhir,
      orderOption
    )
    drawTable(data)
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Terjadi Error",
      text: err.data ? err.data.message : err.message,
      showConfirmButton: true,
      timer: 3000,
    })
  }
}

const popUpMessage = async ({
  model = Swal,
  title = "",
  text = "",
  showConfirmButton = false,
  position = "top-end",
  backdrop = false,
  timer = 2000,
  icon = "success",
}) => {
  await model.fire({
    position,
    backdrop,
    icon,
    title,
    text,
    showConfirmButton,
    timer,
  })
}

const defineDateRangePicker = (elementId = "") => {
  // date on window
  return $(`#${elementId}`).daterangepicker(
    {
      startDate: moment().startOf("month"),
      endDate: moment().endOf("month"),
      ranges: {
        "Hari Ini": [moment(), moment()],
        Kemarin: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "1 minggu lalu": [moment().subtract(6, "days"), moment()],
        "Bulan ini": [moment().startOf("month"), moment().endOf("month")],
        "Bulan Kemarin": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      alwaysShowCalendars: true,
      showDropdowns: true,
      minYear: 1901,
      maxYear: parseInt(moment().format("YYYY"), 10),
      autoApply: true,
      opens: "center",
      locale: {
        format: "YYYY-MM-DD",
      },
    },
    async (start, end, label) => {
      dateLabel = label
      tanggalAwal = start.format("YYYY-MM-DD")
      tanggalAkhir = end.format("YYYY-MM-DD")
      changeOrderTableTitle(label)
      return await drawOrderTableByOption(
        dataSopir.kodeSopir,
        tanggalAwal,
        tanggalAkhir
      )
    }
  )
}

const defineDatatables = () => {
  return $("#orderTable").DataTable({
    columns: [
      { defaultContent: "" },
      { data: "tanggalOrder" },
      { data: "customer.contact.nama" },
      { data: "customer.contact.notelp" },
      { data: "customer.contact.alamat" },
      { data: "jumlah" },
      { data: "harga" },
      { data: "jam" },
      { data: "drivers[ ].kodeSopir" },
      { data: "status" },
      { data: "keterangan" },
      {
        defaultContent: `
                <button class="btn btn-datatable btn-icon btn-transparent-dark ml-2 deleteBtn">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="feather feather-trash-2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
                </button>
                `,
      },
    ],
    columnDefs: [
      {
        targets: [1],
        render: (data, type, row) => {
          const [date] = data.split("T")
          return formatMysqlDateToString(date)
        },
      },
      {
        targets: [9],
        render: (data, type, row) => {
          if (data == "Proses") {
            return `<span class="badge badge-warning badge-pill">Proses</span>`
          } else if (data == "Diselesaikan") {
            return `<span class="badge badge-primary badge-pill">Diselesaikan</span>`
          } else {
            return `<span class="badge badge-danger badge-pill">Batal</span>`
          }
        },
      },
    ],
  })
}

const drawTable = (data) => {
  elm.orderTable.clear()
  elm.orderTable.rows.add(data)
  // draw and add number
  elm.orderTable
    .on("order.dt search.dt", function () {
      elm.orderTable
        .column(0, { search: "applied", order: "applied" })
        .nodes()
        .each(function (cell, i) {
          cell.innerHTML = i + 1
        })
    })
    .draw()
  return elm.orderTable
}

const changeOrderTableTitle = (dateRangeLabel = "Bulan Ini") => {
  let title = ""
  let desc = ""
  if (!elm.formTanggal.is(":visible")) {
    switch (orderOption) {
      case "belum":
        title = "Semua Order yang Belum di Cek"
        break
      case "sudah":
        title = "Semua Order yang Sudah di Cek"
        break
      default:
        title = "Semua Order"
        break
    }
  } else {
    switch (orderOption) {
      case "belum":
        title = "Order yang Belum di Cek"
        break
      case "sudah":
        title = "Order yang Sudah di Cek"
        break
      default:
        title = "Order"
        break
    }
    if (dateRangeLabel.toLowerCase() == "custom range") {
      const startDate = formatDateToIndo(
        elm.datePicker.data("daterangepicker").startDate.format("YYYY-MM-DD")
      )
      const endDate = formatDateToIndo(
        elm.datePicker.data("daterangepicker").endDate.format("YYYY-MM-DD")
      )
      desc = `${startDate} - ${endDate}`
    } else {
      desc = dateRangeLabel
    }
  }
  console.log({ title, desc })
  elm.orderTableTitle.text(title)
  elm.orderTableDesc.text(desc)
}
