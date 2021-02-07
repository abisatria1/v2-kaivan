// state
let dataSopir = {
    id: "",
    kodeSopir: "",
    keterangan: "",
    contact: {
      googleId: "",
      etag: "",
      nama: "",
      alamat: "",
      notelp: "",
      raw: "",
      namaKantor: "",
    },
  },
  prevSopir = {},
  tanggalAwal = "",
  tanggalAkhir = "",
  dateLabel = "",
  orderOption = $("#tipeOrderOption").val(),
  driverCode = $("#data-kode-sopir").val(),
  orderCheckedIds = [] //array of id order

// element
const elm = {
  formTanggal: $("#formTanggal"),
  customDateBtn: $("#customTanggalBtn"),
  backDateBtn: $("#backTanggalBtn"),
  datePicker: {},
  orderTable: {},
  orderTableTitle: $("#orderTableTitle"),
  orderTableDesc: $("#orderTableDesc"),
  checkAllBtn: $("#check_all"),
  submitCheckOrderBtn: $("#submitCheckOrderBtn"),
}

$(document).ready(async () => {
  await setState(driverCode)
  isiForm(dataSopir)

  // data binding to state
  $(document).on("input", ".update-data-input", () => {
    dataSopir.kodeSopir = $("#kodeSopir").val()
    dataSopir.keterangan = $("#keteranganSopir").val()
    dataSopir.contact.nama = $("#namaSopir").val()
    dataSopir.kodeSopir = $("#kodeSopir").val()
    dataSopir.contact.notelp = $("#notelpSopir").val()
    dataSopir.contact.alamat = $("#alamatSopir").val()
  })

  //update
  $(document).on("submit", "#updateProfileForm", async (e) => {
    e.preventDefault()
    $(".loading").removeClass("d-none")
    $("#updateBtn").parents(".col").addClass("d-none")
    const data = {
      nama: dataSopir.contact.nama == null ? "" : dataSopir.contact.nama,
      notelp: dataSopir.contact.notelp == null ? "" : dataSopir.contact.notelp,
      alamat: dataSopir.contact.alamat == null ? "" : dataSopir.contact.alamat,
      namaKantor:
        dataSopir.contact.namaKantor == null
          ? ""
          : dataSopir.contact.namaKantor,
      kodeSopir: dataSopir.kodeSopir,
      keterangan: dataSopir.keterangan,
      google: {
        googleId: dataSopir.contact.googleId,
      },
    }
    await doUpdate(dataSopir.id, data)
    $(".loading").addClass("d-none")
    $("#updateBtn").parents(".col").removeClass("d-none")
  })

  // pindah ke tab order
  $(document).on(
    "click",
    'a[aria-selected="true"]:contains("Order")',
    async (e) => {
      changeOrderTableTitle()
      showingCheckAllBtn()
      await drawOrderTableByOption(dataSopir.kodeSopir)

      elm.formTanggal.hide()
      elm.backDateBtn.hide()
      elm.customDateBtn.show()
      elm.submitCheckOrderBtn.hide()
    }
  )

  // custom btn is click
  elm.customDateBtn.click((e) => {
    elm.formTanggal.toggle(500)
    elm.backDateBtn.toggle(500)
    elm.customDateBtn.toggle(500)
    $("#tanggal").click()
  })

  // back btn is click
  elm.backDateBtn.click(async (e) => {
    elm.formTanggal.toggle(500)
    elm.backDateBtn.toggle(500)
    elm.customDateBtn.toggle(500)
  })

  // select tipe order
  $(document).on("change", "#tipeOrderOption", async (e) => {
    orderOption = e.target.value
    changeOrderTableTitle(dateLabel)
    if (!elm.formTanggal.is(":visible")) {
      await drawOrderTableByOption(dataSopir.kodeSopir)
    } else {
      await drawOrderTableByOption(
        dataSopir.kodeSopir,
        tanggalAwal,
        tanggalAkhir
      )
    }
    orderCheckedIds = []
    elm.checkAllBtn.data("is-active", false)
    elm.checkAllBtn.prop("checked", false)
    showingSubmitBtn()
    showingCheckAllBtn()
  })

  //semua check order di klik
  $(document).on("click", "#check_all", (e) => {
    const allOrder = $(".checkBtn")
    const allOrderArr = [...allOrder]
    const isActive = elm.checkAllBtn.data("is-active") //true or false
    orderCheckedIds = [] // set to []
    checkAllOrder(allOrderArr, isActive)

    // changin is active
    if (isActive == true) {
      elm.checkAllBtn.data("is-active", false)
      elm.checkAllBtn.prop("checked", false)
    } else if (isActive == false) {
      elm.checkAllBtn.data("is-active", true)
      elm.checkAllBtn.prop("checked", true)
    }
  })

  // submit check order
  $(document).on("click", "#submitCheckOrderBtn", async (e) => {
    if (!orderCheckedIds.length) {
      return errorMessage(
        "Data tidak Valid",
        "Silahkan tekan tombol 'Cek' pada setiap order yang ingin di cek"
      )
    }
    const hasil = await confirmMessage(
      "Konfirmasi",
      `Apakah anda yakin ingin konfirmasi cek sebanyak ${orderCheckedIds.length} order?`,
      "question"
    )
    if (!hasil) return
    elm.submitCheckOrderBtn.hide()
    await submitCheckOrder()
  })

  // page is change datatable
  elm.orderTable.on("page.dt", () => {
    const allOrder = $(".checkBtn")
    const allOrderArr = [...allOrder]
    allOrderArr.forEach((item) => {
      $(item).data("is-active", false)
      $(item).prop("checked", false)
    })
    orderCheckedIds = []
    elm.submitCheckOrderBtn.hide()
    elm.checkAllBtn.data("is-active", false)
    elm.checkAllBtn.prop("checked", false)
    showingCheckAllBtn()
  })
})
