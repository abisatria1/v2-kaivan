const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
// another file
const {response} = require('./helpers/wrapper.js')
const cors = require('cors')

// database and relation
const db = require('./config/database')
const relation = require('./config/relation')

// middleware
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())
app.use(cors())

// router
const customerRouter = require('./routes/customer')
const driverRouter = require('./routes/driver')
const partnerRouter = require('./routes/partner')

app.use('/api/customer',customerRouter)
app.use('/api/driver', driverRouter)
app.use('/api/partner', partnerRouter)

app.use('/unauthorized' , (req,res,next) => {
    let err = new Error ('Unauthorized access')
    err.status = 401
    next(err)
})

app.use('/hello' , (req,res,next) => res.send('Application successfuly deploy, welcome to the API'))

// error handling
app.use((req,res,next) => {
    let err = new Error('Route tidak ditemukan')
    err.status = 404
    next(err)
})

app.use((err,req,res,next) => {
    const {message} = err
    const status = err.status || 500
    const data = err.data || null
    response(res,false,data,message,status)
})


const port = process.env.PORT || 3000

app.listen(port , () => {
    db.sync({force : false})
    .then(() => console.log(`app is running on port ${port}`))
    .catch(err => console.log(err.message))
}) 