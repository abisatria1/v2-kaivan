const setState = () => {
  tanggalAwal = dateNowMysqlFormat()
  tanggalAkhir = dateNowMysqlFormat()
  elm.dataTable = defineDataTable()
  elm.datePicker = defineDateRangePicker()
}

const drawTable = () => {
  elm.dataTable.ajax.reload()
}

const defineDataTable = (data = []) => {
  const order = $("#clientTable").DataTable({
    data,
    language: {
      processing: "Loading",
      searchPanes: {
        emptyPanes: "Tidak ada data",
      },
    },
    ajax: {
      url: "/api/client",
      cache: false,
      data: (d) => {
        d.tanggalAwal = tanggalAwal
        d.tanggalAkhir = tanggalAkhir
        console.log(d)
      },
      error: (err) => {
        const message = err.data ? err.data.message : err.message
        errorMessage("Internal Error", message)
      },
    },
    processing: true,
    columns: [
      { defaultContent: "" },
      { data: "ipAddress" },
      { data: "campaignid" },
      { data: "adgroupid" },
      { data: "keyword" },
      { data: "device" },
      { data: "desc" },
      { data: "createdAt" },
    ],
    columnDefs: [
      {
        targets: [7],
        render: (data, type, row) => {
          const [date] = data.split("T")
          return formatDateToIndo(date)
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

const defineDateRangePicker = () => {
  return $("#tanggal").daterangepicker(
    {
      startDate: tanggalAwal,
      endDate: tanggalAkhir,
      ranges: {
        "Hari Ini": [moment(), moment()],
        Kemarin: [moment().subtract(1, "days"), moment().subtract(1, "days")],
        "1 minggu lalu": [moment().subtract(6, "days"), moment()],
        "Bulan ini": [moment().startOf("month"), moment().endOf("month")],
        "Bulan Kemarin": [
          moment().subtract(1, "month").startOf("month"),
          moment().subtract(1, "month").endOf("month"),
        ],
      },
      alwaysShowCalendars: true,
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
      tanggalAwal = start.format("YYYY-MM-DD")
      tanggalAkhir = end.format("YYYY-MM-DD")
      drawTable()
    }
  )
}
