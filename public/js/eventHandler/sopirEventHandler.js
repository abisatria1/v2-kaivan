$(document).ready( async () => {
    const sopirTable = defineDataTable()
    await drawTable(sopirTable)
    
    // live editing content
    $('#sopirTable').on('focus', '.editable' , (event) => {
        const elem = event.target
        $(elem).data('prevValue',$(elem).text())
    })

    $('#sopirTable').on('input', '.editable' , (event) => {
        const elem = event.target
        const prevValue = $(elem).data('prevValue')
        const newValue = $(elem).text()
        if (prevValue != newValue) $(elem).addClass('hasChange')
    })

    $('#sopirTable').on('blur', '.hasChange' , async (event) => {
        const elem = event.target
        const colName = $(elem).data('colName')
        const row = $(elem).parent()    

        const cellInfo = sopirTable.cell(elem)[0][0]
    
        const rowData = sopirTable.row(row).data()
        const value = $(elem).text()
        const prevValue = $(elem).data('prevValue')

        const raw = {}
        raw[colName] = value

        try {
            await updateSopir(rowData.id,raw)
            await drawTable(sopirTable)
            // console.log('success')
            addAfterEditAnimations(cellInfo,sopirTable,true)
        } catch (err) {
            addAfterEditAnimations(cellInfo,sopirTable,false)
            $(elem).text(prevValue)
        }
        
        // update data
        $(elem).removeClass('hasChange')
    })
    // $('.editable').prop('disabled',true);
})

const defineDataTable = () => {
    const sopirTable = $('#sopirTable').DataTable({
        columns : [
            {'defaultContent'  : ""},
            {"data" : 'nama'},
            {"data" : 'notelp'},
            {"data" : 'alamat'},
            {"data" : 'kodeSopir'},
            {"data" : 'keterangan'}
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
                    $(td).attr('contenteditable', 'true')
                    $(td).addClass('editable')
                }
            }
        ]
    })
    // tambah nomer
    sopirTable.on( 'order.dt search.dt', function () {
        sopirTable.column(0, {search:'applied', order:'applied'}).nodes().each( function (cell, i) {
            cell.innerHTML = i+1;
        } );
    } ).draw()
    return sopirTable
}

const drawTable = async (table = {}) => {
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