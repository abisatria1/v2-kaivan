// state
let orderData = [],
  orderDate = "",
  orderTable = {},
  newOrderModal = {},
  createData = {
    nama: "",
    notelp: "",
    alamat: "",
    namaKantor: "",
    google: "",
    order: {
      tanggalOrder: "",
      jumlah: 0,
      harga: 0,
      jam: "",
      keterangan: "",
      status: "",
    },
    driverId: -1,
    partnerId: -1,
  },
  cancelToken

let elm = {
  orderDateTitle: $(".orderDate"),
  tanggal: "#tanggal",
  create: {
    form: "#createForm",
    googleId: "#googleId",
    namaKantor: "#namaKantor",
    tanggalOrder: "#tanggalOrder",
    nama: "#nama",
    notelp: "#notelp",
    alamat: "#alamat",
    jumlah: "#jumlah",
    jam: "#jam",
    harga: "#harga",
    sopir: "#sopir",
    jasa: "#jasa",
    status: "#status",
    keterangan: "#keterangan",
    resetSearchIcon: "#resetIcon",
  },
}

$(document).ready(async () => {
  await setState()

  // data binding dari form
  $(document).on("input change blur", ".form-binding", (e) => {
    bindFormData()
  })

  // create
  $(document).on("submit", "#createForm", async (e) => {
    createValidation()
    e.preventDefault()
    if (e.target.checkValidity() !== false) {
      // creating
      try {
        const form = $("#createForm")
        $("#createForm .button").hide()
        $("#createForm .loading").removeClass("d-none")

        // data
        const data = { ...createData }
        if (data.google != "") {
          data.google = { googleId: createData.google }
        } else {
          data.google = undefined
        }
        // sending data
        await addOrder(data)
        drawTable(data.order.tanggalOrder)

        // reset
        $("#createForm .button").show()
        $("#createForm .loading").addClass("d-none")
        $("#modal").iziModal("close")

        $(form).removeClass("was-validated")
        $(form).data("search", true)

        // callback client
        successMessage("Berhasil", "Data order berhasil dimasukkan")
        syncContact()
      } catch (err) {
        const message = err.data ? err.data.message : err.message
        errorMessage("Terjadi Kesalahan", message)
        $("#createForm .button").show()
        $("#createForm .loading").addClass("d-none")
      }
    }
  })

  // searching
  $("body").on("input", ".searchable", async (e) => {
    const formData = $(elm.create.form).data("search")
    if (
      createData.nama === "" &&
      createData.notelp === "" &&
      createData.alamat === ""
    ) {
      $(elm.create.form).data("search", true)
      $(elm.create.googleId).val("")
      $(elm.create.namaKantor).val("")
    }
    if (formData == true) {
      await searching(e.target)
    }
    bindFormData()
  })

  $("body").on("blur", ".searchable", async (e) => {
    const searchResult = $(".searchResult.active")
    $(searchResult).removeClass("active")
    searchResult.empty()
  })

  $(document).on("click", ".searchItem", (e) => {
    const searchItem =
      $(e.target).parents(".searchItem").length == 0
        ? $(e.target)
        : $(e.target).parents(".searchItem")
    chooseSearchItem(searchItem)
    $(elm.create.resetSearchIcon).fadeIn("fast")
    bindFormData()
  })

  $(document).on("focus", "#createForm input", (e) => {
    if ($(e.target).attr("class") != ".searchable") {
      $(".searchResult").removeClass("active")
    }
    if (
      createData.nama === "" &&
      createData.notelp === "" &&
      createData.alamat === ""
    ) {
      $(elm.create.form).data("search", true)
      $(elm.create.googleId).val("")
      $(elm.create.namaKantor).val("")
    }
    bindFormData()
  })

  $(document).on("click", "#resetIcon", (e) => {
    $(elm.create.form).data("search", true)
    $(elm.create.nama).val("")
    $(elm.create.notelp).val("")
    $(elm.create.alamat).val("")
    $(elm.create.googleId).val("")
    $(elm.create.namaKantor).val("")
    bindFormData()
    $(elm.create.resetSearchIcon).fadeOut("fast")
  })

  // live editing
  // live editing content
  $("#orderTable").on("dblclick", ".editable", async (event) => {
    if (event.target.nodeName != "TD") return
    if ($("table").data("active") == "driverId") {
      // close that active
      const driverEdit = $("table").find("#sopirEdit")
      const elem = $(driverEdit).parents("td")
      const prevValue = $(elem).data("prevValue")
      $(elem).empty()
      $(elem).text(prevValue)
    }
    const elem =
      event.target.nodeName == "TD"
        ? $(event.target)
        : $(event.target).parents("td")
    const colName =
      $(elem).data("colName") == undefined
        ? $(elem).parents("td").data("colName")
        : $(elem).data("colName")
    const value =
      colName == "order.status" ? $(elem).text().trim() : $(elem).text()
    $(elem).data("prevValue", value)
    $(elem).text("")
    let str = "",
      option = ""
    switch (colName) {
      case "order.jumlah":
        str = `<input type="number" class="form-control" value="${value}">`
        $(elem).append(str)
        $(elem).find("input").focus()
        break
      case "order.harga":
        str = `<input type="number" style="width : 100px" class="form-control" value="${value}">`
        $(elem).append(str)
        $(elem).find("input").focus()
        break
      case "order.jam":
        str = `<input type="text" style="width : 80px" class="form-control" id="changeTime" style="background-color : white;" value="${value}" readonly>`
        $(elem).append(str)
        $(elem).find("input").focus()
        $("#changeTime").clockpicker({
          placement: "top",
          align: "right",
          autoclose: true,
        })
        break
      case "driverId":
        // disable editable
        $("table").data("active", "driverId")
        str = `<select id="sopirEdit" style="width: 200px" class="custom-select" multiple></select>`
        let button = `
                <div class="mt-2 editBtn">
                    <button id="editCancelBtn" class="btn btn-danger mr-2 btn-sm">Cancel</button>
                    <button id="editSuccessBtn" class="btn btn-success btn-sm">Save</button>
                </div>`
        $(elem).append(str)
        $(elem).append(button)
        const dataSopir = value.split(" ")
        await isiSopir(dataSopir, "#sopirEdit")
        $("#sopirEdit").select2({
          width: "resolve",
          placeholder: "--Sopir--",
          allowClear: true,
        })
        break
      case "partnerId":
        // disable editable
        str = `<select id="jasaEdit" style="width: 200px" class="custom-select"></select>`
        $(elem).append(str)
        $(elem).find("select").focus()
        await isiJasa(value, "#jasaEdit")
        break
      case "order.status":
        str = ` <select class="custom-select" style="width: 150px" id="status" name="status" required>
                                <option value="1">Proses</option>
                                <option value="2">Diselesaikan</option>
                                <option value="3">Batal</option>
                            </select>`
        $(elem).append(str)
        $(elem).find("select").focus()
        $(elem)
          .find("option")
          .each((i, item) => {
            if ($(item).text() == value) $(item).attr("selected", "selected")
          })
        break
      default:
        str = `<textarea class="form-control" style="width : 200px" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`
        $(elem).append(str)
        break
    }
    $(elem).find("textarea").focus()
  })

  // update sopir
  $(document).on("click", "#editCancelBtn", (e) => {
    const elem = $(e.target).parents("td")
    const prevValue = $(elem).data("prevValue")
    $(elem).empty()
    $(elem).text(prevValue)
  })

  $(document).on("click", "#editSuccessBtn", async (e) => {
    const value = $("#sopirEdit").val()
    const editBtn = $("td .editBtn")
    const elem = $(editBtn).parents("td")
    $(editBtn).hide()
    await updateEventOrder(value, elem, orderTable)

    // update data
    syncContact()
    $(elem).removeClass("hasChange")
  })

  $("#orderTable").on("blur", ".editable", async (event) => {
    const textarea = event.target //textarea
    const elem = $(textarea).parents("td") //cell / td
    $(textarea).attr("disabled", true)
    const value = $(textarea).val()
    const prevValue = $(elem).data("prevValue")
    // cek kolom
    if ($(elem).data("colName") == "driverId") return
    else if ($(elem).data("colName") == "partnerId") {
      const rowData = orderTable.row($(elem).parents("tr")).data()
      if (!rowData.partner && value == -1) {
        $(textarea).remove()
        return $(elem).text(prevValue)
      } else if (!rowData.partner && value != -1) {
        //
      } else {
        if (rowData.partner.id == value) {
          $(elem).empty()
          return $(elem).text(prevValue)
        }
      }
    } else if ($(elem).data("colName") == "order.status") {
      if ($("td select option:selected").text() == prevValue) {
        $(textarea).remove()
        if (prevValue == "Proses") {
          sts = `<span class="badge badge-warning badge-pill">Proses</span>`
        } else if (prevValue == "Diselesaikan") {
          sts = `<span class="badge badge-primary badge-pill">Diselesaikan</span>`
        } else {
          sts = `<span class="badge badge-danger badge-pill">Batal</span>`
        }
        return $(elem).append(sts)
      }
    }

    if (value === prevValue) {
      $(textarea).remove()
      return $(elem).text(prevValue)
    } else {
      if ($(elem).data("colName") == "notelp") {
        if (prevValue != "" && value == "") {
          errorMessage("Data tidak benar", "No telpon tidak boleh kosong")
          addAfterEditAnimations(orderTable.cell(elem)[0][0], orderTable, false)
          $(elem).empty()
          $(elem).removeClass("hasChange")
          return $(elem).text($(elem).data("prevValue"))
        }
      }
    }

    await updateEventOrder(value, elem, orderTable)

    // update data
    syncContact()
    $(elem).removeClass("hasChange")
  })

  //delete
  $("table").on("click", ".deleteBtn", (e) => {
    e.preventDefault()
    const swalWithBootstrapButtons = Swal.mixin({
      customClass: {
        cancelButton: "btn btn-danger p-2 w-25",
        confirmButton: "btn btn-success p-2 ml-4 w-25",
      },
      buttonsStyling: false,
    })

    swalWithBootstrapButtons
      .fire({
        title: "Apakah and ingin menghapus data ini ?",
        text: "Data tidak dapat dikembalikan",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Yes",
        cancelButtonText: "No",
        reverseButtons: true,
      })
      .then(async (result) => {
        if (result.value) {
          // delete proccess
          const elem = $(e.target)
          const data = orderTable.row($(elem).parents("td")).data()
          try {
            const result = await deleteOrder(data.id)
            popUpMessage({
              model: swalWithBootstrapButtons,
              title: "Deleted!",
              text: "Data order berhasil dihapus.",
            })
            const date = $("#tanggal").val()
            await drawTable(date)
          } catch (err) {
            popUpMessage({
              model: swalWithBootstrapButtons,
              title: "Error!",
              text: err.data ? err.data.message : err.message,
              icon: "error",
            })
          }
        }
      })
  })
})

const defineDataTable = (tanggalAwal = "") => {}

const createValidation = () => {
  $(".needs-validation .select2-selection").addClass("is-valid")
  let forms = $(".needs-validation")
  // Loop over them and prevent submission
  Array.prototype.filter.call(forms, (form) => {
    $(".form-control").each((i, elem) => {
      $(elem).siblings(".invalid-feedback").text("")
      $(elem).siblings(".invalid-feedback").text(elem.validationMessage)
    })
    $(form).on("input", ".form-control", (e) => {
      const elem = e.target
      if (elem.checkValidity() == false) {
        $(elem).siblings(".invalid-feedback").text("")
        $(elem).siblings(".invalid-feedback").text(elem.validationMessage)
      }
    })
    if (form.checkValidity() === false) {
      event.preventDefault()
      event.stopPropagation()
    }
    form.classList.add("was-validated")
  })
}

const popUpMessage = ({
  model = Swal,
  title = "",
  text = "",
  showConfirmButton = false,
  position = "top-end",
  backdrop = false,
  timer = 2000,
  icon = "success",
}) => {
  model.fire({
    position,
    backdrop,
    icon,
    title,
    text,
    showConfirmButton,
    timer,
  })
}

const searching = async (elem) => {
  const searchResult = $(elem).siblings(".searchResult")
  let str = ""
  str = $(elem).val()

  searchResult.empty()
  if (str.length == 0) {
    $(searchResult).removeClass("active")
    searchResult.empty()
    return
  }

  //Check if there are any previous pending requests
  if (typeof cancelToken != typeof undefined) {
    cancelToken.cancel("Operation canceled due to new request.")
  }
  cancelToken = axios.CancelToken.source()
  let result = await searchContact(str, cancelToken)
  result = result.data

  if (result.length !== 0) {
    $(searchResult).addClass("active")
    result.map((item) => {
      searchResult.append(
        `
            <div class="searchItem">
                <div class="desc">
                    <input type="hidden" value="${item.googleId}">
                    <h5 class="searchNama">${
                      item.nama == null ? "" : item.nama
                    }</h5>
                    <p class="searchNamaKantor">${
                      item.namaKantor == null ? "" : item.namaKantor
                    }</p>
                    <p class="searchAlamat">${
                      item.alamat == null ? "" : item.alamat
                    }</p>
                    <p class="searchNotelp">${
                      item.notelp == null ? "" : item.notelp
                    }</p>
                </div>
            </div>
            `
      )
    })
  } else {
    $(searchResult).removeClass("active")
    searchResult.empty()
  }
}

const chooseSearchItem = (elem) => {
  const googleId = $(elem).find("input").val()
  const nama = $(elem).find(".searchNama").text()
  const alamat = $(elem).find(".searchAlamat").text()
  const notelp = $(elem).find(".searchNotelp").text()
  const namaKantor = $(elem).find(".searchNamaKantor").text()

  $("#nama").val(nama)
  $("#alamat").val(alamat)
  $("#notelp").val(notelp)
  $("#googleId").val(googleId)
  $("#namaKantor").val(namaKantor)

  const searchResult = $(".searchResult.active")
  $(searchResult).removeClass("active")
  searchResult.empty()

  $("#createForm").data("search", "false")
}

const addAfterEditAnimations = async ({ row, column }, table, type) => {
  const cell = table.cell(row, column).nodes()
  if (type == true) {
    $(cell).addClass("successEdit")
    setTimeout(() => {
      $(cell).removeClass("successEdit")
    }, 1000)
  } else {
    $(cell).addClass("errEdit")
    setTimeout(() => {
      $(cell).removeClass("errEdit")
    }, 1000)
  }
}

const updateEventOrder = async (value, elem, orderTable) => {
  const colName = $(elem).data("colName")
  const row = $(elem).parent()

  const cellInfo = orderTable.cell(elem)[0][0]
  const rowData = orderTable.row(row).data()
  //
  let driverId = []
  if (rowData.drivers.length)
    driverId = rowData.drivers.map((sopir) => sopir.id)
  const raw = {
    nama:
      rowData.customer.contact.nama == null
        ? ""
        : rowData.customer.contact.nama,
    notelp:
      rowData.customer.contact.notelp == null
        ? ""
        : rowData.customer.contact.notelp,
    alamat:
      rowData.customer.contact.alamat == null
        ? ""
        : rowData.customer.contact.alamat,
    namaKantor:
      rowData.customer.contact.namaKantor == null
        ? ""
        : rowData.customer.contact.namaKantor,
    order: {},
    driverId,
    partnerId: rowData.partner == null ? -1 : rowData.partner.id,
    google: {
      googleId: rowData.customer.contact.googleId,
    },
  }
  const isOrder = colName.split(".")

  if (isOrder.length != 1) {
    raw.order[isOrder[1]] = value
  } else {
    raw[colName] = value
  }

  try {
    await updateOrder(rowData.id, raw)
    await drawTable($("#tanggal").val())
    popUpMessage({
      title: "Perubahan berhasil disimpan",
    })
    $(elem).empty()
    if (colName != "order.status") {
      addAfterEditAnimations(cellInfo, orderTable, true)
    }
  } catch (err) {
    Swal.fire({
      icon: "error",
      title: "Data tidak valid",
      text: err.data ? err.data.message : err.message,
      showConfirmButton: true,
      timer: 3000,
    })
    if (colName != "order.status") {
      addAfterEditAnimations(cellInfo, orderTable, false)
    }
    $(elem).empty()
    $(elem).text($(elem).data("prevValue"))
  }
}
