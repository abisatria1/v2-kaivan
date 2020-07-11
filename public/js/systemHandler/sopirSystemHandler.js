const baseUrl = $('#base_url').val()

const loadSopir = async () => {
    return new Promise(async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/driver/`,
                method : 'GET',
            })
            resolve(result.data)
        } catch (err) {
            console.log(err)
            reject(err.response)
        }
    })
}

const updateSopir = async (id,data) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/driver/${id}`,
                method : 'PATCH',
                data : data
            })
            resolve(result.data)
        } catch (err) {
            console.log(err.response)
            reject(err.response)
        }
    })
}

const createSopir = async (data) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/driver/`,
                method : 'POST',
                data : data
            })
            resolve(result.data)
        } catch (err) {
            console.log(err.response)
            reject(err.response)
        }
    })
}

const deleteSopir = async (id) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/driver/${id}`,
                method : 'DELETE'
            })
            resolve(result.data)
        } catch (err) {
            console.log(err.response)
            reject(err.response)
        }
    })
}

const searchContact = async (param= "",value="") => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/contact/search/${param}?value=${value}`,
                method : 'GET'
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
            url : `/api/contact/syncContact`,
            method : 'GET'
        })
    } catch (err) {
        console.log(err.response)
    }
}