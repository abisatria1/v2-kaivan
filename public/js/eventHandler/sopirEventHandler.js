

$(document).ready( async () => {
    const sopirTable = defineDataTable()
    await drawTable(sopirTable)
    const modal = $('#modal').iziModal({
        title : 'Tambah Data Sopir',
        subtitle : 'Diharapkan mengisi data dengan benar dan bertanggung jawab',
        headerColor : '#CF5300',
        closeButton : false,
        width : 700,
        onOpening : () => {
            $('#createSopir').removeClass('was-validated')
        }
    }) 

    // create
    $(document).on('submit','form',async (e) => {
        createValidation()
        e.preventDefault()
        if (e.target.checkValidity() !== false) {
            // creating
            try {
                const form = $('form')
                $('#createForm .button').hide()
                $('#createForm .loading').removeClass('d-none')

                // data
                const data = {
                    nama : $('#nama').val(),
                    notelp : $('#notelp').val(),
                    alamat : $('#alamat').val(),
                    kodeSopir : $('#kodeSopir').val(),
                    keterangan : $('#keterangan').val(),
                    namaKantor : $('#namaKantor').val(),
                    google : $('#googleId').val() == "" ? undefined : {googleId : $('#googleId').val()}
                }
                await createSopir(data)
                drawTable(sopirTable)
                $('#createForm .button').show()
                $('#createForm .loading').addClass('d-none') 
                $('#modal').iziModal('close')
                // reset form
                $('#createForm .form-control').each((i,elem) => {
                    $(elem).val('') 
                })
                popUpMessage({
                    model : Swal,
                    title : "Berhasil",
                    text : "Data sopir berhasil ditambahkan"
                })
                $(form).removeClass('was-validated')
                syncContact()
                $(form).data('search',true)
            } catch (err) {
                popUpMessage({
                    model : Swal,
                    title : "Gagal",
                    text : err.data ? err.data.message : err.message,
                    icon : 'error'
                })
            }
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
                const data = sopirTable.row($(elem).parents('td')).data()
                try {
                    const result = await deleteSopir(data.id)
                    popUpMessage({
                        model : swalWithBootstrapButtons,
                        title : 'Deleted!',
                        text : 'Data sopir berhasil dihapus.'
                    })
                    drawTable(sopirTable)
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
    
    // live editing content
    $('#sopirTable').on('dblclick', '.editable' , (event) => {
        const elem = event.target
        const value = $(elem).text()
        $(elem).data('prevValue',value)
        $(elem).text('')
        $(elem).append(`<textarea class="form-control" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`)
        $(elem).find('textarea').focus()
    })

    $('#sopirTable').on('taphold', '.editable' , (event) => {
        const elem = event.target
        const value = $(elem).text()
        $(elem).data('prevValue',value)
        $(elem).text('')
        $(elem).append(`<textarea class="form-control" name="text" rows="2" cols="10" wrap="soft">${value}</textarea>`)
        $(elem).find('textarea').focus()
    })
    
    $('#sopirTable').on('blur', '.editable' , async (event) => {
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

        const cellInfo = sopirTable.cell(elem)[0][0]
        const rowData = sopirTable.row(row).data()
        
        const raw = {
            nama : rowData.contact.nama == null ? "" : rowData.contact.nama,
            notelp : rowData.contact.notelp == null ? "": rowData.contact.notelp,
            alamat : rowData.contact.alamat == null ? "": rowData.contact.alamat,
            namaKantor : rowData.contact.namaKantor == null ? "" : rowData.contact.namaKantor,
            kodeSopir : rowData.kodeSopir,
            keterangan : rowData.keterangan,
            google : {
                googleId : rowData.contact.googleId
            }
        }
        raw[colName] = value

        try {
            await updateSopir(rowData.id,raw)
            await drawTable(sopirTable)
            popUpMessage({
                title : 'Perubahan berhasil disimpan'
            })
            $(textarea).remove()
            addAfterEditAnimations(cellInfo,sopirTable,true)
        } catch (err) {
            Swal.fire({
                // position: 'top-end',
                icon: 'error',
                title: 'Data tidak valid',
                text : err.data ? err.data.message : err.message,
                showConfirmButton: true,
                timer: 3000
            })
            
            addAfterEditAnimations(cellInfo,sopirTable,false)
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
        console.log('click')
        const searchItem = $(e.target).parents('.searchItem').length == 0 ? $(e.target) : $(e.target).parents('.searchItem')
        chooseSearchItem(searchItem)
    })

    $(document).on('focus', '#createForm input' ,(e) => {
        if ($(e.target).attr('class') != '.searchable') {
            $('.searchResult').removeClass('active')
        }
    })
})

const defineDataTable = () => {
    const sopir = $('#sopirTable').DataTable({
        columns : [
            {'defaultContent'  : ""},
            {"data" : 'contact.nama'},
            {"data" : 'contact.notelp'},
            {"data" : 'contact.alamat'},
            {"data" : 'kodeSopir'},
            {"data" : 'keterangan'},
            {
                "defaultContent" : 
                `
                <button class="btn btn-danger deleteBtn"><img src="/images/trash.svg" alt="delete"></button>
                <button class="btn btn-info viewBtn"><img src="/images/eye.svg" alt="delete"></button>
                `
            }
        ],
        columnDefs: [
            {
                'targets': [1,2,3,4,5],
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
                            $(td).data('colName', 'kodeSopir')
                            break
                        case 5:
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
    sopir.on( 'order.dt search.dt', function () {
        sopir.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw()
    return sopir
}

const drawTable = async (table) => {
    const driverJson = await loadSopir()
    table.clear()
    table.rows.add(driverJson.data)
    table.draw()
}

const addAfterEditAnimations = async ({row,column} , sopirTable, type) => {
    const cell = sopirTable.cell(row,column).nodes()
    console.log(cell)
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

const createValidation = () => {
    let forms = $('.needs-validation')
    // Loop over them and prevent submission
    Array.prototype.filter.call(forms, (form) => {
        $('.form-control').each((i,elem) => {
            $(elem).next().text("")
            $(elem).next().text(elem.validationMessage)
        })
        $(form).on('input', '.form-control' , (e) => {
            const elem = e.target
            if (elem.checkValidity() == false) {
                $(elem).next().text("")
                $(elem).next().text(elem.validationMessage)
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