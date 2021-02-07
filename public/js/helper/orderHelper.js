const setState = async () => {
  doSyncContact()
  isiJasa()
  orderDate = dateNowMysqlFormat()
  newOrderModal = defineModal()
  orderTable = defineOrderTable()
  defineDateInputOnPage()
  defineDateInputOnForm()

  elm.orderDateTitle.text(formatDateToIndo(orderDate))
}

const drawTable = async (date = "") => {
  orderDate = date
  elm.orderDateTitle.text(formatDateToIndo(date))
  orderTable.ajax.reload()
}

const defineModal = () => {
  const modal = $("#modal").iziModal({
    title: "Tambah Data Order",
    subtitle: "Diharapkan mengisi data dengan benar dan bertanggung jawab",
    headerColor: "#4E73DF",
    closeButton: true,
    focusInput: false,
    width: 700,
    onClosing: () => {
      $("#createForm .form-control").each((i, elem) => {
        if ($(elem).attr("id") !== "tanggalOrder") {
          $(elem).val("")
        }
        $("#jasa").val(-1)
        $("#status").val(1)
      })
      $("#createForm").removeClass("was-validated")
      $("#createForm").data("search", true)
      $("#sopir").empty()
      $(elm.create.resetSearchIcon).hide()
    },
    onOpening: async () => {
      await isiSopir()
      $(elm.create.tanggalOrder).data("daterangepicker").setStartDate(orderDate)
      $(elm.create.tanggalOrder).data("daterangepicker").setEndDate(orderDate)
      // select2
      $("#sopir").select2({
        width: "resolve",
        placeholder: "--Sopir--",
        allowClear: true,
      })
      $(".clockpicker").clockpicker({
        placement: "top",
        align: "right",
        autoclose: true,
      })
    },
  })
  return modal
}

const defineOrderTable = (orderData = []) => {
  const order = $("#orderTable").DataTable({
    data: orderData,
    language: {
      processing: "Loading",
      searchPanes: {
        emptyPanes: "Tidak ada data",
      },
    },
    ajax: {
      url: "/api/order",
      cache: false,
      data: (d) => {
        d.tanggalAwal = orderDate
      },
      error: (err) => {
        const message = err.data ? err.data.message : err.message
        errorMessage("Internal Error", message)
      },
    },
    processing: true,
    scrollY: 500,
    scrollCollapse: true,
    scroller: true,
    deferLoading: true,
    columns: [
      { defaultContent: "" },
      { data: "customer.contact.nama" },
      { data: "customer.contact.notelp" },
      { data: "customer.contact.alamat" },
      { data: "jumlah" },
      { data: "harga" },
      { data: "jam" },
      { data: "drivers[ ].kodeSopir" },
      { data: "partner", defaultContent: "" },
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
        targets: [5],
        render: (data, type, row) => {
          return fromNumberToMoney(data)
        },
      },
      {
        targets: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
        createdCell: function (td, cellData, rowData, row, col) {
          switch (col) {
            case 1:
              $(td).data("colName", "nama")
              break
            case 2:
              $(td).data("colName", "notelp")
              break
            case 3:
              $(td).data("colName", "alamat")
              break
            case 4:
              $(td).data("colName", "order.jumlah")
              break
            case 5:
              $(td).data("colName", "order.harga")
              break
            case 6:
              $(td).data("colName", "order.jam")
              break
            case 7:
              $(td).data("colName", "driverId")
              break
            case 8:
              $(td).data("colName", "partnerId")
              break
            case 9:
              $(td).data("colName", "order.status")
              break
            case 10:
              $(td).data("colName", "order.keterangan")
              break
            default:
              break
          }
          $(td).addClass("editable")
        },
      },
      {
        targets: [8],
        render: (data, type, row) => {
          if (data == null || !data) return
          return data ? data.contact.nama : ""
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
  // tambah nomer
  order
    .on("order.dt search.dt", function () {
      order
        .column(0, { search: "applied", order: "applied" })
        .nodes()
        .each(function (cell, i) {
          cell.innerHTML = i + 1
        })
    })
    .draw()
  return order
}

const defineDateInputOnForm = () => {
  // date on input
  $("#tanggalOrder").daterangepicker({
    singleDatePicker: true,
    showDropdowns: true,
    minYear: 1901,
    maxYear: parseInt(moment().format("YYYY"), 10),
    autoApply: true,
    opens: "center",
    locale: {
      format: "YYYY-MM-DD",
    },
  })
}

const defineDateInputOnPage = () => {
  // date on window
  $("#tanggal").daterangepicker(
    {
      singleDatePicker: true,
      showDropdowns: true,
      minYear: 1901,
      maxYear: parseInt(moment().format("YYYY"), 10),
      autoApply: true,
      opens: "center",
      locale: {
        format: "YYYY-MM-DD",
      },
    },
    (start, end, label) => {
      const tanggalAwal = start.format("YYYY-MM-DD")
      $(".orderDate").text(formatDateToIndo(tanggalAwal))
      drawTable(tanggalAwal)
    }
  )
}

const isiJasa = async (prevJasa = "", elem = "#jasa") => {
  const jasa = await loadJasa()
  let str = ``
  if (prevJasa !== "" || elem == "#jasaEdit") {
    str = `<option value="-1"></option>`
    $(jasa.data).each((i, elem) => {
      if (elem.contact.nama == prevJasa) {
        str += `<option selected value="${elem.id}">${elem.contact.nama}</option>`
      } else {
        str += `<option value="${elem.id}">${elem.contact.nama}</option>`
      }
    })
  } else {
    str = `<option selected value="-1">--Jasa--</option>`
    $(jasa.data).each((i, elem) => {
      str += `<option value="${elem.id}">${elem.contact.nama}</option>`
    })
  }
  $(`${elem}`).append(str)
}

const isiSopir = async (prevData = [], elem = "#sopir") => {
  const sopir = await loadSopir()
  let str = ``
  if (prevData.length != 0) {
    $(sopir.data).each((i, elem) => {
      if (prevData.indexOf(elem.kodeSopir) != -1) {
        str += `<option selected value="${elem.id}">${elem.kodeSopir}</option>`
      } else {
        str += `<option value="${elem.id}">${elem.kodeSopir}</option>`
      }
    })
  } else {
    $(sopir.data).each((i, elem) => {
      str += `<option value="${elem.id}">${elem.kodeSopir}</option>`
    })
  }
  $(`${elem}`).append(str)
}

const doSyncContact = async () => {
  try {
    await syncContact()
  } catch (err) {
    console.log(err)
  }
}

const bindFormData = () => {
  createData.google = $(elm.create.googleId).val()
  createData.namaKantor = $(elm.create.namaKantor).val()
  createData.order.tanggalOrder = $(elm.create.tanggalOrder).val()
  createData.nama = $(elm.create.nama).val()
  createData.notelp = $(elm.create.notelp).val()
  createData.alamat = $(elm.create.alamat).val()
  createData.order.jumlah = $(elm.create.jumlah).val()
  createData.order.jam = $(elm.create.jam).val()
  createData.order.harga = fromMoneyToNumber($(elm.create.harga).val())
  createData.driverId = $(elm.create.sopir).val()
  createData.partnerId = $(elm.create.jasa).val()
  createData.order.status = $(elm.create.status).val()
  createData.order.keterangan = $(elm.create.keterangan).val()
}

const openDateRangePicker = () => {
  $("#tanggal").click()
}
