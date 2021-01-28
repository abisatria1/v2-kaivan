// state
const setState = async (driverCode = "") => {
  try {
    const result = await loadSpesificSopir(driverCode)
    if (!result.data) throw new Error("Driver not found")
    dataSopir = result.data
    prevSopir = { ...result.data }
  } catch (err) {
    await Swal.fire({
      // position: 'top-end',
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
      // position: 'top-end',
      icon: "error",
      title: "Data tidak valid",
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
