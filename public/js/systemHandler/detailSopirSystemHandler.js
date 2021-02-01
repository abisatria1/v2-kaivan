const baseUrl = $("#base_url").val()

const loadSpesificSopir = async (driverCode) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/driver/detail/${driverCode}`,
        method: "GET",
      })
      resolve(result.data)
    } catch (err) {
      reject(err.response)
    }
  })
}

const updateSopir = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/driver/${id}`,
        method: "PATCH",
        data: data,
      })
      resolve(result.data)
    } catch (err) {
      reject(err.response)
    }
  })
}

const getAllDriverOrder = async (
  kodeSopir,
  tanggalAwal,
  tanggalAkhir,
  tipeOrder
) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/driver/order/${kodeSopir}`,
        method: "GET",
        params: {
          tanggalAwal,
          tanggalAkhir,
          tipeOrder,
        },
      })
      resolve(result.data)
    } catch (err) {
      console.log(err.response)
      reject(err.response)
    }
  })
}

const checkOrder = async (kodeSopir, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/driver/order/${kodeSopir}`,
        method: "POST",
        data: data,
      })
      resolve(result.data)
    } catch (err) {
      reject(err.response)
    }
  })
}
