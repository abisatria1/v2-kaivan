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
  driverCode = $("#data-kode-sopir").val()

// element
const elm = {
  formTanggal: $("#formTanggal"),
  customDateBtn: $("#customTanggalBtn"),
  backDateBtn: $("#backTanggalBtn"),
  datePicker: {},
  orderTable: {},
  orderTableTitle: $("#orderTableTitle"),
  orderTableDesc: $("#orderTableDesc"),
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

      await drawOrderTableByOption(dataSopir.kodeSopir)

      elm.formTanggal.hide()
      elm.backDateBtn.hide()
      elm.customDateBtn.show()
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
  })
})
