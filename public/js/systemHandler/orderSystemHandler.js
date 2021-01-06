const baseUrl = $("#base_url").val()

const loadOrder = async (tanggalAwal = "") => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/order?tanggalAwal=${tanggalAwal}`,
        method: "GET",
      })
      resolve(result.data)
    } catch (err) {
      console.log(err)
      reject(err.response)
    }
  })
}

const addOrder = async (data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/order`,
        method: "POST",
        data: data,
      })
      resolve(result.data)
    } catch (err) {
      console.log(err)
      reject(err.response)
    }
  })
}

const loadSopir = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/driver/`,
        method: "GET",
      })
      resolve(result.data)
    } catch (err) {
      console.log(err)
      reject(err.response)
    }
  })
}

const loadJasa = async () => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/partner/`,
        method: "GET",
      })
      resolve(result.data)
    } catch (err) {
      console.log(err)
      reject(err.response)
    }
  })
}

const updateOrder = async (id, data) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/order/${id}`,
        method: "PATCH",
        data: data,
      })
      resolve(result.data)
    } catch (err) {
      console.log(err.response)
      reject(err.response)
    }
  })
}

const deleteOrder = async (id) => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/order/${id}`,
        method: "DELETE",
      })
      resolve(result.data)
    } catch (err) {
      console.log(err.response)
      reject(err.response)
    }
  })
}

const searchContact = async (value = "") => {
  return new Promise(async (resolve, reject) => {
    try {
      const result = await axios({
        url: `/api/contact/search?value=${value}`,
        method: "GET",
      })
      resolve(result.data)
    } catch (err) {
      console.log(err.response)
      reject(err.response)
    }
  })
}

const syncContact = async () => {
  try {
    const result = await axios({
      url: `/api/contact/syncContact`,
      method: "GET",
    })
  } catch (err) {
    console.log(err.response)
  }
}
