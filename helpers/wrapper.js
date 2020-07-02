const response = (res,status,data,message,code) => {
    let resData
    if (status) resData = data
    else {
        if (data == null || data == "") resData = {}
        else resData = data
    }
    let response = {
        ok : status,
        message : message,
        code : code,
        data : resData
    }
    res.status(code).send(response)
}

const customError  = (message , status) => {
    const err = new Error(message)
    err.status = status
    return err
}


module.exports = {
    response,
    customError
}