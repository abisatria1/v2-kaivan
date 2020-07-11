const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const axios = require('axios')
const path = require('path')
const hbs = require('express-handlebars')
const loggerConf = require('./config/logger')
const {setGoogleClient} = require('./helpers/googleClient')

// another file
const {response} = require('./helpers/wrapper.js')
const cors = require('cors')

// database and relation
const db = require('./config/database')
const relation = require('./config/relation')

// 1 hour sync contact
setInterval(async () => {
    logger.info('running scheduled sync')
    try {
        const date = new Date(Date.now())
        const hasil = await axios({
            url : `${process.env.BASE_URL}/api/contact/syncContact`,
            method : 'GET'
        })
        const dateExecuted = date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate()
        const timeExecuted = date.getHours() + ":" + date.getMinutes()
        logger.info(`${hasil.data.data.totalPeople} has been sync with database , ${dateExecuted} - ${timeExecuted}`)
    } catch (err) {
        const error = err.response ? err.response.data : err
        logger.error(error)
    }
}, 1000 * 10)

app.engine('hbs', hbs({
    extname: 'hbs',
    defaultLayout : 'default',
    layoutsDir: __dirname + '/views/layouts/',
    partialsDir : __dirname + '/views/partials/'
}))
app.set('view engine', 'hbs')
app.set('views', path.join(__dirname, 'views'))
app.use(express.static(path.join(__dirname, '/public')));


// middleware
app.use(bodyParser.urlencoded({extended : false}))
app.use(bodyParser.json())
app.use(cors())

// router
const customerRouter = require('./routes/customer')
const driverRouter = require('./routes/driver')
const partnerRouter = require('./routes/partner')
const orderRouter = require('./routes/order')
const viewsRouter = require('./routes/views')
const contactRouter = require('./routes/contact')
app.use(viewsRouter)
app.use('/api/customer',customerRouter)
app.use('/api/contact',setGoogleClient(),contactRouter)
app.use('/api/driver', setGoogleClient(),driverRouter)
app.use('/api/partner',setGoogleClient(), partnerRouter)
app.use('/api/order', setGoogleClient(),orderRouter)

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
    .then(() => logger.debug(`app is running on port ${port}`))
    .catch(err => logger.error(err.message))
})