
$(document).ready(async () => {
    const orderTable = defineDataTable()
    await drawTable(orderTable,dateNow())
    isiJasa()
    const modal = $('#modal').iziModal({
        title : 'Tambah Data Order',
        subtitle : 'Diharapkan mengisi data dengan benar dan bertanggung jawab',
        headerColor : '#CF5300',
        closeButton : true,
        focusInput : false,
        width : 700,
        onClosing : () => {
            $('#createForm .form-control').each((i,elem) => {
                if ($(elem).attr('id') !== 'tanggalOrder') {
                    $(elem).val('')
                }
            })
            $("#createForm").removeClass('was-validated')
            $("#createForm").data('search',true)
            $('#sopir').empty()
        },
        onOpening : async () => {
            await isiSopir()
            // select2
            $('#sopir').select2({
                width: 'resolve',
                placeholder: "--Sopir--",
                allowClear: true    
            })
            $('.clockpicker').clockpicker({
                placement: 'top',
                align: 'right',
                autoclose: true
            })
        }
    }) 

    // create
    $(document).on('submit','#createForm',async (e) => {
        createValidation()
        e.preventDefault()
        if (e.target.checkValidity() !== false) {
            // creating
            try {
                const form = $('#createForm')
                $('#createForm .button').hide()
                $('#createForm .loading').removeClass('d-none')

                // data
                const data = {
                    nama : $('#nama').val(),
                    notelp : $('#notelp').val(),
                    alamat : $('#alamat').val(),
                    namaKantor : $('#namaKantor').val(),
                    google : $('#googleId').val() == "" ? undefined : {googleId : $('#googleId').val()},
                    order : {
                        tanggalOrder : $('#tanggalOrder').val(),
                        jumlah : $('#jumlah').val(),
                        harga : $('#harga').val(),
                        keterangan : $('#keterangan').val(),
                        status : $('#status').val(),
                    },
                    driverId : $('#sopir').val(),
                    partnerId : $('#jasa').val(),
                }

                // sending data
                await addOrder(data)
                drawTable(orderTable,data.order.tanggalOrder)

                // reset
                $('#createForm .button').show()
                $('#createForm .loading').addClass('d-none') 
                $('#modal').iziModal('close')
                
                $(form).removeClass('was-validated')
                $(form).data('search',true)

                // callback client
                popUpMessage({
                    model : Swal,
                    title : "Berhasil",
                    text : "Data Order berhasil ditambahkan"
                })
                syncContact()
            } catch (err) {
                popUpMessage({
                    model : Swal,
                    title : "Gagal",
                    text : err.data ? err.data.message : err.message,
                    icon : 'error'
                })
                $('#createForm .button').show()
                $('#createForm .loading').addClass('d-none') 
            }
        }
    })

    // searching
    $('body').on('input', '.searchable', (e) => {
        const nama = $('#nama').val()
        const alamat = $('#alamat').val()
        const notelp =  $('#notelp').val()
        const formData = $('#createForm').data('search')
        if (nama === "" && notelp === "" && alamat === "") {
            $('#createForm').data('search',true)
            $('#googleId').val('')
            $('#namaKantor').val('')
        }
        if (formData == true) {
            searching(e.target)
        }
    })

    $(document).on('click' ,'.searchItem', (e) => {
        const searchItem = $(e.target).parents('.searchItem').length == 0 ? $(e.target) : $(e.target).parents('.searchItem')
        chooseSearchItem(searchItem)
    })

    $(document).on('focus', '#createForm input' ,(e) => {
        const nama = $('#nama').val()
        const alamat = $('#alamat').val()
        const notelp =  $('#notelp').val()
        if ($(e.target).attr('class') != '.searchable') {
            $('.searchResult').removeClass('active')
        }
        if (nama === "" && notelp === "" && alamat === "") {
            $('#createForm').data('search',true)
            $('#googleId').val('')
            $('#namaKantor').val('')
        }
    })

    // live editing
    // live editing content
    $('#orderTable').on('dblclick', '.editable' , async (event) => {
        if ( $('table').data('active') == 'driverId') {
            // close that active
            const driverEdit = $('table').find('#sopirEdit')
            const elem = $(driverEdit).parents('td')
            const prevValue = $(elem).data('prevValue')
            $(elem).empty()
            $(elem).text(prevValue)
        } 
        const elem = event.target
        const colName = $(elem).data('colName')
        const value = $(elem).text()
        $(elem).data('prevValue',value)
        $(elem).text('')
        
        let str = "" , option =""
        switch (colName) {
            case "order.jumlah" : 
                str = `<input type="number" class="form-control" value="${value}">`
                $(elem).append(str)
                $(elem).find('input').focus()
                break
            case "order.harga" : 
                str = `<input type="number" style="width : 100px" class="form-control" value="${value}">`
                $(elem).append(str)
                $(elem).find('input').focus()
                break
            case "order.jam":
                str = `<input type="text" style="width : 80px" class="form-control" id="changeTime" style="background-color : white;" value="${value}" readonly>`
                $(elem).append(str)
                $(elem).find('input').focus()
                $('#changeTime').clockpicker({
                    placement: 'top',
                    align: 'right',
                    autoclose: true,
                })
                break
            case "driverId" : 
                // disable editable
                $('table').data('active','driverId')
                str = `<select id="sopirEdit" style="width: 200px" class="custom-select" multiple></select>`
                let button = `
                <div class="mt-2 editBtn">
                    <button id="editCancelBtn" class="btn btn-danger mr-2 btn-sm">Cancel</button>
                    <button id="editSuccessBtn" class="btn btn-success btn-sm">Save</button>
                </div>`
                $(elem).append(str)
                $(elem).append(button)
                const dataSopir = value.split(',')
                await isiSopir(dataSopir,'#sopirEdit')
                $('#sopirEdit').select2({
                    width: 'resolve',
                    placeholder: "--Sopir--",
                    allowClear: true,
                })
                break
            case "partnerId" : 
                // disable editable
                str = `<select id="jasaEdit" style="width: 200px" class="custom-select"></select>`
                $(elem).append(str)
                $(elem).find('select').focus()
                await isiJasa(value,'#jasaEdit')
                break
            case 'order.status' : 
                str = ` <select class="custom-select" style="width: 150px" id="status" name="status" required>
                                <option value="1">Proses</option>
                                <option value="2">Diselesaikan</option>
                                <option value="3">Batal</option>
                            </select>`
                $(elem).append(str)
                $(elem).find('select').focus()
                $(elem).find('option').each((i,item) => {
                    if ($(item).text() == value) $(item).attr('selected', 'selected')
                })
                break
            default:
                str = `<textarea class="form-control" style="width : 200px" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`
                $(elem).append(str)
                break
        }
        $(elem).find('textarea').focus()
    })

    // update sopir
    $(document).on('click', '#editCancelBtn' , (e) => {
        const elem = $(e.target).parents('td')
        const prevValue = $(elem).data('prevValue')
        $(elem).empty()
        $(elem).text(prevValue)
    })  
    $(document).on('click', '#editSuccessBtn' ,async (e) => {
        const value = $('#sopirEdit').val()
        const editBtn = $('td .editBtn')
        const elem = $(editBtn).parents('td')
        $(editBtn).hide()
        await updateEventOrder(value,elem,orderTable)

        // update data
        syncContact()
        $(elem).removeClass('hasChange')
    })
    
    $('#orderTable').on('blur', '.editable' , async (event) => {
        const textarea = event.target //textarea
        const elem = $(textarea).parents('td') //cell / td
        $(textarea).attr('disabled' , true)
        const value = $(textarea).val()
        const prevValue = $(elem).data('prevValue')
        // cek kolom
        if ($(elem).data('colName') == 'driverId') return
        else if ($(elem).data('colName') == 'partnerId') {
            const rowData = orderTable.row($(elem).parents('tr')).data()
            if (!rowData.partner && value == -1) {
                $(textarea).remove()
                return $(elem).text(prevValue)
            }else if (!rowData.partner && value != -1) {
                // 
            }else {
                if (rowData.partner.id  == value) {
                    $(elem).empty()
                    return $(elem).text(prevValue)  
                }
            }
        }else if ($(elem).data('colName') == 'order.status') {
            if($('td select option:selected').text() == prevValue) {
                $(textarea).remove()
                return $(elem).text(prevValue)
            }
        }

        if (value === prevValue) {
            $(textarea).remove()
            return $(elem).text(prevValue)
        }

        await updateEventOrder(value,elem,orderTable)

        // update data
        syncContact()
        $(elem).removeClass('hasChange')
    })

     //delete
    $('table').on('click', '.deleteBtn' , (e) => {
        e.preventDefault()
        const swalWithBootstrapButtons = Swal.mixin({
            customClass: {
                cancelButton: 'btn btn-danger p-2 w-25',
                confirmButton: 'btn btn-success p-2 ml-4 w-25'
            },
            buttonsStyling: false
        })
        
        swalWithBootstrapButtons.fire({
            title: 'Apakah and ingin menghapus data ini ?',
            text: "Data tidak dapat dikembalikan",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Yes',
            cancelButtonText: 'No',
            reverseButtons: true
        }).then(async (result) => {
            if (result.value) {
                // delete proccess
                const elem = $(e.target)
                const data = orderTable.row($(elem).parents('td')).data()
                try {
                    const result = await deleteOrder(data.id)
                    popUpMessage({
                        model : swalWithBootstrapButtons,
                        title : 'Deleted!',
                        text : 'Data order berhasil dihapus.'
                    })
                    const date = $('#tanggal').val()
                    await drawTable(orderTable,date)
                } catch (err) {
                    popUpMessage({
                        model : swalWithBootstrapButtons,
                        title : 'Error!',
                        text : err.data ? err.data.message : err.message,
                        icon : 'error'
                    })
                }
            }
        })
    })


    // date on input
    $('#tanggalOrder').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: 1901,
        maxYear: parseInt(moment().format('YYYY'),10),
        autoApply : true,
        "opens": "center",
        locale: {
            format: 'YYYY-MM-DD'
        }
    })

    // date on window
    $('#tanggal').daterangepicker({
        singleDatePicker: true,
        showDropdowns: true,
        minYear: 1901,
        maxYear: parseInt(moment().format('YYYY'),10),
        autoApply : true,
        "opens": "center",
        locale: {
            format: 'YYYY-MM-DD'
        }
    },(start,end,label) => {
        const tanggalAwal = start.format('YYYY-MM-DD')
        $('.orderDate').text(formatDateToIndo(tanggalAwal))
        drawTable(orderTable,tanggalAwal)
    })

})

const defineDataTable = () => {
    const order = $('#orderTable').DataTable({
        columns : [
            {'defaultContent'  : ""},
            {"data" : 'customer.contact.nama'},
            {"data" : 'customer.contact.notelp'},
            {"data" : 'customer.contact.alamat'},
            {"data" : 'jumlah'},
            {"data" : 'harga'},
            {"data" : 'jam'},
            {"data" : 'drivers[,].kodeSopir'},
            {"data" : 'partner', "defaultContent" : ""},
            {"data" : 'status'},
            {"data" : 'keterangan'},
            {
                "defaultContent" : 
                `
                <button class="btn btn-danger deleteBtn"><img src="/images/trash.svg" alt="delete"></button>
                <button class="btn btn-info viewBtn"><img src="/images/eye.svg" alt="view"></button>
                `
            },
        ],
        columnDefs: [
            {
                'targets': [1,2,3,4,5,6,7,8,9,10],
                'createdCell':  function (td, cellData, rowData, row, col) {
                    switch (col) {
                        case 1:
                            $(td).data('colName', 'nama')
                            break
                        case 2:
                            $(td).data('colName', 'notelp')
                            break
                        case 3:
                            $(td).data('colName', 'alamat')
                            break
                        case 4:
                            $(td).data('colName', 'order.jumlah')
                            break
                        case 5:
                            $(td).data('colName', 'order.harga')
                            break
                        case 6:
                            $(td).data('colName', 'order.jam')
                            break
                        case 7:
                            $(td).data('colName', 'driverId')
                            break
                        case 8:
                            $(td).data('colName', 'partnerId')
                            break
                        case 9:
                            $(td).data('colName', 'order.status')
                            break
                        case 10:
                            $(td).data('colName', 'order.keterangan')
                            break
                        default:
                            break
                    }
                    $(td).addClass('editable')
                }
            },
            {
                targets : [8],
                render : (data,type,row) => {
                    if (data == null || !data) return
                    return data ? data.contact.nama : ""
                }
            }
        ],
        rowCallback:  (row, data) => {
            console.log(data)
            if (data.status == "Proses") {
                $(row).addClass('table-warning')
            }else if (data.status == "Diselesaikan" ) {
                $(row).addClass('table-primary')
            }else if (data.status == "Batal") {
                $(row).addClass('table-danger')
            }
        }
    })
    // tambah nomer
    order.on( 'order.dt search.dt', function () {
        order.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw()
    return order
}

const drawTable = async (table,date="") => {
    $('.orderDate').text(formatDateToIndo(date))
    const order = await loadOrder(date)
    table.clear()
    table.rows.add(order.data)
    table.draw()
}

const createValidation = () => {
    $('.needs-validation .select2-selection').addClass('is-valid')
    let forms = $('.needs-validation')
    // Loop over them and prevent submission
    Array.prototype.filter.call(forms, (form) => {
        $('.form-control').each((i,elem) => {
            $(elem).siblings('.invalid-feedback').text("")
            $(elem).siblings('.invalid-feedback').text(elem.validationMessage)
        })
        $(form).on('input', '.form-control' , (e) => {
            const elem = e.target
            if (elem.checkValidity() == false) {
                $(elem).siblings('.invalid-feedback').text("")
                $(elem).siblings('.invalid-feedback').text(elem.validationMessage)
            }
        })
        if (form.checkValidity() === false) {
            event.preventDefault()
            event.stopPropagation()
        }
        form.classList.add('was-validated')
    })
}

const popUpMessage = ({
    model = Swal,
    title = "",
    text = "",
    showConfirmButton = false,
    position = 'top-end',
    backdrop = false,
    timer = 2000,
    icon = 'success'
}) => {
    model.fire({
        position,
        backdrop,
        icon,
        title,
        text,
        showConfirmButton,
        timer
    })
}

const searching = async (elem) => {
    const searchResult = $(elem).siblings('.searchResult')
    let str=""
    str = $(elem).val()
    
    searchResult.empty()
    if (str.length == 0) {
        $(searchResult).removeClass('active')
        searchResult.empty()
        return
    }
    let result = await searchContact(str)  
    result = result.data

    if (result.length !== 0 ) {
        $(searchResult).addClass('active')
        result.map(item => {
            searchResult.append(
            `
            <div class="searchItem">
                <div class="desc">
                    <input type="hidden" value="${item.googleId}">
                    <h5 class="searchNama">${item.nama == null ? "" : item.nama}</h5>
                    <p class="searchNamaKantor">${item.namaKantor == null ? "" : item.namaKantor}</p>
                    <p class="searchAlamat">${item.alamat == null ? "" : item.alamat}</p>
                    <p class="searchNotelp">${item.notelp == null ? "" : item.notelp}</p>
                </div>
            </div>
            `
            )
        })
    }else {
        $(searchResult).removeClass('active')
        searchResult.empty()
    }   
}

const chooseSearchItem = (elem) => {
    const googleId = $(elem).find('input').val()
    const nama = $(elem).find('.searchNama').text()
    const alamat = $(elem).find('.searchAlamat').text()
    const notelp = $(elem).find('.searchNotelp').text()
    const namaKantor = $(elem).find('.searchNamaKantor').text()
    
    $('#nama').val(nama)
    $('#alamat').val(alamat)
    $('#notelp').val(notelp)
    $('#googleId').val(googleId)
    $('#namaKantor').val(namaKantor)

    const searchResult = $('.searchResult.active')
    $(searchResult).removeClass('active')
    searchResult.empty()

    $('#createForm').data('search','false')
}

const addAfterEditAnimations = async ({row,column} , table, type) => {
    const cell = table.cell(row,column).nodes()
    if (type==true) {
        $(cell).addClass('successEdit')
        setTimeout(() => {
            $(cell).removeClass('successEdit')
        }, 1000)
    } else {
        $(cell).addClass('errEdit')
        setTimeout(() => {
            $(cell).removeClass('errEdit')
        }, 1000)
    }
}

const isiSopir = async (prevData = [], elem = "#sopir") => {
    const sopir = await loadSopir()
    let str = ``
    if (prevData.length != 0) {
        $(sopir.data).each((i,elem) => {
            if (prevData.indexOf(elem.kodeSopir) != -1) {
                str += `<option selected value="${elem.id}">${elem.kodeSopir}</option>`
            }else {
                str += `<option value="${elem.id}">${elem.kodeSopir}</option>`
            }
        })
    }else {
        $(sopir.data).each((i,elem) => {
            str += `<option value="${elem.id}">${elem.kodeSopir}</option>`
        })
    }
    $(`${elem}`).append(str)
}   

const isiJasa = async (prevJasa = "", elem = "#jasa") => {
    const jasa = await loadJasa()
    let str = ``
    if (prevJasa !== "" || elem == "#jasaEdit") {
        str = `<option value="-1"></option>`
        $(jasa.data).each((i,elem) => {
            if (elem.contact.nama == prevJasa) {
                str += `<option selected value="${elem.id}">${elem.contact.nama}</option>`
            }else {
                str += `<option value="${elem.id}">${elem.contact.nama}</option>`
            }
        })
    }else {
        str = `<option selected value="-1">--Jasa--</option>`
        $(jasa.data).each((i,elem) => {
            str += `<option value="${elem.id}">${elem.contact.nama}</option>`
        })
    }
    $(`${elem}`).append(str)
}

const dateNow = (date) => {
    if (!date) date = new Date(Date.now())
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    return `${year}-${month}-${day}`
}

const formatDateToIndo = (date) => {
    if (!date) return
    const tanggal = new Date(date)
    const year = tanggal.getFullYear()
    const day = tanggal.getDate()
    let month = tanggal.getMonth()
    switch (month) {
        case 0:
            month = "Januari"
            break;
        case 1:
            month = "Februari"
            break;
        case 2:
            month = "Maret"
            break;
        case 3:
            month = "April"
            break;
        case 4:
            month = "Mei"
            break;
        case 5:
            month = "Juni"
            break;
        case 6:
            month = "Juli"
            break;
        case 7:
            month = "Agustus"
            break;
        case 8:
            month = "September"
            break;
        case 9:
            month = "Oktober"
            break;
        case 10:
            month = "November"
            break;
        case 11:
            month = "Desember"
            break;
        default:
            break;
    }
    return `${day} ${month} ${year}`
}

const updateEventOrder  =  async (value,elem,orderTable) => {
    const colName = $(elem).data('colName')
    const row = $(elem).parent()    

    const cellInfo = orderTable.cell(elem)[0][0]
    const rowData = orderTable.row(row).data()
    //
    let driverId = []
    if (rowData.drivers.length) driverId = rowData.drivers.map(sopir => sopir.id)
    const raw = {
        nama : rowData.customer.contact.nama == null ? "" : rowData.customer.contact.nama,
        notelp : rowData.customer.contact.notelp == null ? "": rowData.customer.contact.notelp,
        alamat : rowData.customer.contact.alamat == null ? "": rowData.customer.contact.alamat,
        namaKantor : rowData.customer.contact.namaKantor == null ? "" : rowData.customer.contact.namaKantor,
        order : {
            
        },
        driverId,
        partnerId : rowData.partner == null ? -1 : rowData.partner.id,
        google : {
            googleId : rowData.customer.contact.googleId
        }
    }
    const isOrder = colName.split('.')

    if (isOrder.length != 1) {
        raw.order[isOrder[1]] = value
    }else {
        raw[colName] = value
    }

    try {
        await updateOrder(rowData.id,raw)
        await drawTable(orderTable,$('#tanggal').val())
        popUpMessage({
            title : 'Perubahan berhasil disimpan'
        })
        $(elem).empty()
        if (colName != 'order.status') {
            addAfterEditAnimations(cellInfo,orderTable,true)
        }
    } catch (err) {
        Swal.fire({
            icon: 'error',
            title: 'Data tidak valid',
            text : err.data ? err.data.message : err.message,
            showConfirmButton: true,
            timer: 3000
        })
        if (colName != 'order.status') {
            addAfterEditAnimations(cellInfo,orderTable,false)
        }
        $(elem).empty()
        $(elem).text($(elem).data('prevValue'))
    }
}