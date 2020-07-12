const baseUrl = $('#base_url').val()

const loadJasa = async () => {
    return new Promise(async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/partner/`,
                method : 'GET',
            })
            resolve(result.data)
        } catch (err) {
            console.log(err)
            reject(err.response)
        }
    })
}

const updateJasa = async (id,data) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/partner/${id}`,
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

const createJasa = async (data) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/partner/`,
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

const deleteJasa = async (id) => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/partner/${id}`,
                method : 'DELETE'
            })
            resolve(result.data)
        } catch (err) {
            console.log(err.response)
            reject(err.response)
        }
    })
}

const searchContact = async (value="") => {
    return new Promise (async (resolve,reject) => {
        try {
            const result = await axios({
                url : `/api/contact/search?value=${value}`,
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