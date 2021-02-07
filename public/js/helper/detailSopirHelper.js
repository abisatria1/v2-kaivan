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
    const text = err.data ? err.data.message : err.message
    await errorMessage("Terjadi Error", text)
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
      await successMessage("Perubahan berhasil disimpan")
      return (window.location.href = `/sopir/detail/${dataSopir.kodeSopir}`)
    }
    successMessage("Perubahan berhasil disimpan")
    return isiForm()
  } catch (err) {
    const text = err.data ? err.data.message : err.message
    errorMessage("Terjadi Error", text)
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
    const text = err.data ? err.data.message : err.message
    errorMessage("Terjadi Error", text)
  }
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
      { data: "customer.contact.alamat" },
      { data: "jumlah" },
      { data: "harga" },
      { data: "jam" },
      { data: "drivers[ ].kodeSopir" },
      { data: "status" },
      { data: "keterangan" },
      {
        data: "isCheck",
        defaultContent: "",
      },
      {
        data: "isCheck",
        defaultContent: "",
      },
    ],
    scrollY: 500,
    scrollCollapse: true,
    scroller: true,
    deferLoading: true,
    columnDefs: [
      {
        targets: [5],
        render: (data, type, row) => {
          return fromNumberToMoney(data)
        },
      },
      {
        targets: [1],
        render: (data, type, row) => {
          const [date] = data.split("T")
          return formatMysqlDateToString(date)
        },
      },
      {
        targets: [8],
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
      {
        targets: 10,
        render: (isCheck, type, row) => {
          if (isCheck == 1) {
            return `<div class="text-success isCheckElement"><i class="fas fa-check"></i></div>`
          } else {
            return `<div class="text-danger isCheckElement"><i class="fas fa-times"></i></div>`
          }
        },
      },
      {
        targets: 11,
        render: (isCheck, type, row) => {
          if (!isCheck) {
            return `
            <input type="checkbox" class="btn-check checkBtn" data-order="${row.id}" id="check-order-${row.id}" data-is-active="false" autocomplete="off" onclick=checkOneOrder(this) onload=isValidToCheck(this)>
            <label class="btn btn-outline-success" for="check-order-${row.id}">Cek</label>
            `
          }
          return ""
        },
      },
    ],
    footerCallback: function (tfoot, data, start, end, display) {
      const isNotCheckOrder = data.find((item) => item.isCheck == 0)
      if (!isNotCheckOrder) {
        $(tfoot).addClass("d-none")
      } else {
        $(tfoot).removeClass("d-none")
      }
    },
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

const checkAllOrder = (allOrderElmArr, isCheckAllActive) => {
  allOrderElmArr.forEach((item) => {
    checkOneOrder(item, isCheckAllActive)
  })
}

const checkOneOrder = (element, isCheckAllActive) => {
  const isElmActive = $(element).data("is-active")
  const orderId = $(element).data("order")
  const idx = orderCheckedIds.findIndex((item, index, obj) => item == orderId)

  if (isCheckAllActive != undefined) {
    if (isCheckAllActive == true) {
      $(element).prop("checked", false)
      $(element).data("is-active", false)
    } else if (isCheckAllActive == false) {
      orderCheckedIds.push(orderId)
      $(element).prop("checked", true)
      $(element).data("is-active", true)
    }
  } else {
    if (isElmActive == true) {
      orderCheckedIds.splice(idx)
      $(element).prop("checked", false)
      $(element).data("is-active", false)
    } else {
      orderCheckedIds.push(orderId)
      $(element).prop("checked", true)
      $(element).data("is-active", true)
    }
    IfAllHaveBeenChecked()
  }
  showingSubmitBtn()
}

const IfAllHaveBeenChecked = () => {
  const allOrderCheckBtn = [...$(".checkBtn")]
  if (orderCheckedIds.length == allOrderCheckBtn.length) {
    elm.checkAllBtn.data("is-active", true)
    elm.checkAllBtn.prop("checked", true)
  } else {
    elm.checkAllBtn.data("is-active", false)
    elm.checkAllBtn.prop("checked", false)
  }
}

const showingSubmitBtn = () => {
  if (!orderCheckedIds.length) {
    elm.submitCheckOrderBtn.hide()
  } else {
    elm.submitCheckOrderBtn.show()
  }
}

const showingCheckAllBtn = () => {
  const allOrder = $(".checkBtn")
  const allOrderArr = [...allOrder]
  if (!allOrderArr.length) {
    elm.checkAllBtn.hide()
  } else {
    elm.checkAllBtn.show()
  }
}

const isValidToCheck = (element) => {
  const id = $(element).data("order")
  if (orderCheckedIds.contains(id)) {
    $(element).data("is-active", true)
    $(element).prop("checked", true)
  }
}

const submitCheckOrder = async () => {
  const data = { orderIds: [...orderCheckedIds] }
  const kodeSopir = dataSopir.kodeSopir
  try {
    const hasil = await checkOrder(kodeSopir, data)
    await drawOrderTableByOption(kodeSopir, tanggalAwal, tanggalAkhir)
    await successMessage("Order berhasil di cek")
  } catch (err) {
    const text = err.data ? err.data.message : err.message
    errorMessage("Terjadi Error", text)
  }
}
