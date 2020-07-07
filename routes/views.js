const router = require('express-promise-router')()
const dotenv = require('dotenv').config()

router.route('/')
    .get((req,res,next) => {
        res.redirect('/dashboard')
    })

router.route('/dashboard')
    .get((req,res,next) => {
        res.render('dashboard', {
            title : 'Dashboard',
            pageCss : ""
        })
    })

router.route('/order')
    .get((req,res,next) => {
        res.render('order', {
            title : 'Order',
            pageCss : `/css/order.css`,
            eventHandler : '/js/eventHandler/orderEventHandler.js',
            systemHandler : '/js/systemHandler/orderSystemHandler.js',
        })
    })

router.route('/jasa')
    .get((req,res,next) => {
        res.render('jasa', {
            title : 'Jasa',
            pageCss : ""
        })
    })

router.route('/sopir')
    .get((req,res,next) => {
        res.render('sopir', {
            title : 'Sopir',
            pageCss : "/css/sopir.css",
            eventHandler : '/js/eventHandler/sopirEventHandler.js',
            systemHandler : '/js/systemHandler/sopirSystemHandler.js',
            base_url : process.env.BASE_URL
        })
    })

router.route('/pelanggan')
    .get((req,res,next) => {
        res.render('pelanggan', {
            title : 'Pelanggan',
            pageCss : ""
        })
    })

module.exports = router