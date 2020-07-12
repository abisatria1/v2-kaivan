$(document).ready(async () => {
    const jasaTable = defineDataTable()
    await drawTable(jasaTable)
    const modal = $('#modal').iziModal({
        title : 'Tambah Data Jasa',
        subtitle : 'Diharapkan mengisi data dengan benar dan bertanggung jawab',
        headerColor : '#CF5300',
        closeButton : true,
        width : 700,
        onClosing : () => {
            $('#createForm .form-control').each((i,elem) => {
                $(elem).val('') 
            })
            $("#createForm").removeClass('was-validated')
            $("#createForm").data('search',true)
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
                    norek : $('#norek').val(),
                    statusJasa : $('#statusJasa').val(),
                    tipePembayaran : $('#tipePembayaran').val(),
                    keterangan : $('#keterangan').val(),
                    namaKantor : $('#namaKantor').val(),
                    google : $('#googleId').val() == "" ? undefined : {googleId : $('#googleId').val()}
                }
                // sending data
                await createJasa(data)
                drawTable(jasaTable)

                // reset
                $('#createForm .button').show()
                $('#createForm .loading').addClass('d-none') 
                $('#modal').iziModal('close')
                $('#createForm .form-control').each((i,elem) => {
                    $(elem).val('') 
                })
                $(form).removeClass('was-validated')
                $(form).data('search',true)

                // callback client
                popUpMessage({
                    model : Swal,
                    title : "Berhasil",
                    text : "Data Jasa berhasil ditambahkan"
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

    // live editing
    // live editing content
    $('#jasaTable').on('dblclick', '.editable' , (event) => {
        const elem = event.target
        const colName = $(elem).data('colName')
        const value = $(elem).text()
        $(elem).data('prevValue',value)
        $(elem).text('')
        
        let str = "" , option =""
        switch (colName) {
            case "statusJasa":
                    if (value == "Aktif") {
                        option = `
                        <option selected value="Aktif">Aktif</option>
                        <option value="Pasif">Pasif</option>`
                    }else {
                        option = `
                        <option  value="Aktif">Aktif</option>
                        <option selected value="Pasif">Pasif</option>`
                    }
                    str = `<select class="custom-select">${option}</select>`
                    break
                case "tipePembayaran" : 
                    if (value == "1" || value == 1) {
                        option = `
                        <option selected value="1">1</option>
                        <option value="2">2</option>`
                    }else {
                        option = `
                        <option  value="1">1</option>
                        <option selected value="2">2</option>`
                    }
                    str = `<select class="custom-select">${option}</select>`
                    break
            default:
                str = `<textarea class="form-control" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`
                break
        }
        $(elem).append(str)
        $(elem).find('textarea').focus()
    })

    $('#jasaTable').on('taphold', '.editable' , (event) => {
        const elem = event.target
        const colName = $(elem).data('colName')
        const value = $(elem).text()
        $(elem).data('prevValue',value)
        $(elem).text('')
        
        let str = "" , option =""
        switch (colName) {
            case "statusJasa":
                    if (value == "Aktif") {
                        option = `
                        <option selected value="Aktif">Aktif</option>
                        <option value="Pasif">Pasif</option>`
                    }else {
                        option = `
                        <option  value="Aktif">Aktif</option>
                        <option selected value="Pasif">Pasif</option>`
                    }
                    str = `<select class="custom-select">${option}</select>`
                    break
                case "tipePembayaran" : 
                    if (value == "1" || value == 1) {
                        option = `
                        <option selected value="1">1</option>
                        <option value="2">2</option>`
                    }else {
                        option = `
                        <option  value="1">1</option>
                        <option selected value="2">2</option>`
                    }
                    str = `<select class="custom-select">${option}</select>`
                    break
            default:
                str = `<textarea class="form-control" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`
                break
        }
        $(elem).append(str)
    })
    
    $('#jasaTable').on('blur', '.editable' , async (event) => {
        const textarea = event.target //textarea
        const elem = $(textarea).parent()

        const value = $(textarea).val()
        const prevValue = $(elem).data('prevValue')
        if (value === prevValue) {
            $(textarea).remove()
            return $(elem).text(prevValue)
        }

        const colName = $(elem).data('colName')
        const row = $(elem).parent()    

        const cellInfo = jasaTable.cell(elem)[0][0]
        const rowData = jasaTable.row(row).data()
        
        const raw = {
            nama : rowData.contact.nama == null ? "" : rowData.contact.nama,
            notelp : rowData.contact.notelp == null ? "": rowData.contact.notelp,
            alamat : rowData.contact.alamat == null ? "": rowData.contact.alamat,
            namaKantor : rowData.contact.namaKantor == null ? "" : rowData.contact.namaKantor,
            norek : rowData.norek == null ? "" : rowData.norek,
            statusJasa : rowData.statusJasa == null ? "" : rowData.statusJasa,
            tipePembayaran : rowData.tipePembayaran == null ? "" : rowData.tipePembayaran,
            keterangan : rowData.keterangan,
            google : {
                googleId : rowData.contact.googleId
            }
        }
        raw[colName] = value

        try {
            await updateJasa(rowData.id,raw)
            await drawTable(jasaTable)
            popUpMessage({
                title : 'Perubahan berhasil disimpan'
            })
            $(textarea).remove()
            addAfterEditAnimations(cellInfo,jasaTable,true)
        } catch (err) {
            Swal.fire({
                icon: 'error',
                title: 'Data tidak valid',
                text : err.data ? err.data.message : err.message,
                showConfirmButton: true,
                timer: 3000
            })
            
            addAfterEditAnimations(cellInfo,jasaTable,false)
            $(elem).text(prevValue)
        }
        
        // update data
        syncContact()
        $(elem).removeClass('hasChange')
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
                const data = jasaTable.row($(elem).parents('td')).data()
                try {
                    const result = await deleteJasa(data.id)
                    popUpMessage({
                        model : swalWithBootstrapButtons,
                        title : 'Deleted!',
                        text : 'Data Jasa berhasil dihapus.'
                    })
                    drawTable(jasaTable)
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
})

const defineDataTable = () => {
    const jasa = $('#jasaTable').DataTable({
        columns : [
            {'defaultContent'  : ""},
            {"data" : 'contact.nama'},
            {"data" : 'contact.notelp'},
            {"data" : 'contact.alamat'},
            {"data" : 'norek'},
            {"data" : 'statusJasa'},
            {"data" : 'tipePembayaran'},
            {"data" : 'keterangan'},
            {
                "defaultContent" : 
                `
                <button class="btn btn-danger deleteBtn"><img src="/images/trash.svg" alt="delete"></button>
                <button class="btn btn-info viewBtn"><img src="/images/eye.svg" alt="view"></button>
                `
            }
        ],
        columnDefs: [
            {
                'targets': [1,2,3,4,5,6,7],
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
                            $(td).data('colName', 'norek')
                            break
                        case 5:
                            $(td).data('colName', 'statusJasa')
                            break
                        case 6:
                            $(td).data('colName', 'tipePembayaran')
                            break
                        case 7:
                            $(td).data('colName', 'keterangan')
                            break
                        default:
                            break
                    }
                    $(td).addClass('editable')
                }
            }
        ]
    })
    // tambah nomer
    jasa.on( 'order.dt search.dt', function () {
        jasa.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw()
    return jasa
}

const drawTable = async (table) => {
    const partnerJson = await loadJasa()
    table.clear()
    table.rows.add(partnerJson.data)
    table.draw()
}

const createValidation = () => {
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