const express = require('express')
const app = express()
const bodyParser = require('body-parser')
const dotenv = require('dotenv').config()
const axios = require('axios')
const path = require('path')
const hbs = require('express-handlebars')
const loggerConf = require('./config/logger')
const {setGoogleClient} = require('./helpers/googleClient')
const {syncContactFunc} = require('./controllers/contact')

// another file
const {response} = require('./helpers/wrapper.js')
const cors = require('cors')
const {google} = require('googleapis')
const cron = require('node-cron');
// database and relation
const db = require('./config/database')
const relation = require('./config/relation')
const Secret = require('./models/Secret')


cron.schedule('*/2 * * * *', async () => {
    try {
        logger.info('running schedule sync')
        const result = await axios({
            method : 'get',
            url : 'kaivan.abisatria.my.id/api/contact/SyncContact'
        })
        const data = result.data.data
        logger.debug(`${data.totalPeople} data berhasil di sinkronisasi`)
        logger.info('success running schedule sync ')
    } catch (err) {
        const error = err.respose ? err.response.message : err.message
        logger.error(error)
        logger.error('failed running schedule sync')
    }
})

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