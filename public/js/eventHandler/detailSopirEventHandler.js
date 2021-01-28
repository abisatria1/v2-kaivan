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
  prevSopir,
  driverCode = $("#data-kode-sopir").val()

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
})
