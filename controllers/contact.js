const {response,customError} = require('../helpers/wrapper')
const Op = require('sequelize').Op
// models
const Contact = require('../models/Contact')
const GoogleToken = require('../models/GoogleToken')
// helpers
const {
    getContact,
    createGoogleContact,
    updateGoogleContact,
    saveSyncContact,
    deleteGoogleContact,
    createSyncArr
} = require('../helpers/googleContact')

const fetcingGoogleContact = async (syncTokenParam = "") => {
    // fetching all data
    let result, i = 1, resArr = [], totalPeople = 0
    let nextPageToken, syncToken , nextSyncToken

    while (nextPageToken || i==1) {
        result = await getContact({pageToken : nextPageToken,syncToken : syncTokenParam})
        resArr.push(result)
        nextPageToken = result.nextPageToken ? result.nextPageToken : undefined
        syncToken = result.syncToken ? result.syncToken : undefined
        nextSyncToken = result.nextSyncToken ? result.nextSyncToken : undefined
        if (result.connections) totalPeople += result.connections.length
        logger.debug(`fetcing ${i} with total people = ${totalPeople}`)
        i++
    }
    if (syncToken != "" || nextSyncToken != "") {
        // update token
        const token = nextSyncToken || syncToken
        logger.debug(`sync token : ${token}`)
        // update
        if (token) {
            await GoogleToken.update({syncToken : token},{where : {id : 1}})
            const obj = await GoogleToken.findByPk(1)
            if (obj) {
                await obj.update({syncToken : token})
                logger.debug('updated sync token')
            }else {
                await GoogleToken.create({syncToken : token})
                logger.debug('created sync token')
            }
        }
    }
    return resArr
}

const syncContactFunc = async () => {
    const googleToken = await GoogleToken.findByPk(1)
    const syncToken = googleToken ? googleToken.syncToken : ""
    const resArr = await fetcingGoogleContact(syncToken)

    let syncDb = {}
    syncDb = await saveSyncContact(resArr)

    const {createdData,updatedData,deletedData} = syncDb.data

    const insertDb = await createSyncArr([...createdData,...updatedData])
    
    let bottom = 0,top = 0,index = 1,totalPeople = 0
    while (top < insertDb.length) {
        if (insertDb.length < (50*index)) top = insertDb.length
        else top = (index * 50)
        logger.debug('syncing start')
        const insert = insertDb.slice(bottom,top)
        await Contact.bulkCreate(insert, { updateOnDuplicate: ["nama","etag","namaKantor","alamat","notelp","raw"] })
        
        totalPeople = top
        logger.debug('syncing ' + totalPeople)
        bottom = top
        index++
    }
    logger.info('returning all data...')
    const report = {
        updatedData : updatedData.length,
        deletedData : deletedData.length,
        createdData : createdData.length,
    }
    logger.debug(`${totalPeople} has been sync with database`)
    return logger.info('done')
}

const getAllContactGoogle = async (req,res,next) => {
    logger.info('running get all google contact data')
    const resArr = await fetcingGoogleContact()
    logger.info('returning all data...')
    response(res,true,resArr,`berhasil mendapatkan ${totalPeople}`,200)
    logger.info('done')
}

const getAllContact = async (req,res,next) => {
    logger.info('running get database contact data')
    const contact = await Contact.findAll({
        limit : 100
    })
    response(res,true,contact,'Berhasil mendapat semua contact',200)
    logger.info('sending all contact data')
}

const createContact = async (req,res,next) => {
    logger.info('running create contact data')
    // create google contact
    const contact = await createGoogleContact(req.body)
    logger.debug('creating google contact')
    
    // assign to database
    req.body.googleId = contact.resourceName
    req.body.etag = contact.etag
    req.body.raw = JSON.stringify(contact)
    req.body.notelp = contact.phoneNumbers[0].canonicalForm
    const result = await Contact.create(req.body)
    
    response(res,true,result,'Berhasil membuat kontak',201)
    logger.info('sending all created data')
}

const getSpesificContact = async (req,res,next) => {
    logger.info('running getSpesific contact data')
    const {contactGoogleId} = req.query
    if (!contactGoogleId) return response(res,false,null,'Google id diperlukan',400)
    let contact = await Contact.findByPk(contactGoogleId)
    if (!contact) return response(res,false,null,'Tidak ada kontak dalam database',400)
    // parsing raw
    contact.raw = JSON.parse(contact.raw)
    response(res,true,contact,'Berhasil mendapatkan data',200)
    logger.info('sending all spesific contact data')
}

const updateContact = async (req,res,next) => {
    logger.info('running updated contact data')
    const {contactGoogleId} = req.query
    if (!contactGoogleId) return response(res,false,null,'Google id diperlukan',400)
    
    const contact = await Contact.findByPk(contactGoogleId)
    if (!contact) return response(res,false,null,'Tidak ada kontak dalam database',400)
    
    const prev = {googleId,etag} = contact
    const updateGoogle = await updateGoogleContact(prev,req.body)
    
    req.body.etag = updateGoogle.etag
    req.body.raw = JSON.stringify(updateGoogle)
    req.body.notelp = updateGoogle.phoneNumbers[0].canonicalForm
    await contact.update(req.body)
    const result = await Contact.findByPk(contactGoogleId)
    
    response(res,true,{result,updateGoogle},'Contact berhasil diupdate',200)
    logger.info('sending all updated contact data')
}

const deleteContact = async (req,res,next) => {
    logger.info('running delete contact data')
    const {contactGoogleId} = req.query
    if (!contactGoogleId) return response(res,false,null,'Google id diperlukan',400)
    
    const contact = await Contact.findByPk(contactGoogleId)
    if (!contact) return response(res,false,null,'Tidak ada kontak dalam database',400)
    
    await deleteGoogleContact(contact.googleId)
    
    await contact.destroy()
    response(res,true,{},'Contact berhasil dihapus',200)
    logger.info('Successfully delete data')
}

const syncContact = async (req,res,next) => {
    const googleToken = await GoogleToken.findByPk(1)
    const syncToken = googleToken ? googleToken.syncToken : ""
    const resArr = await fetcingGoogleContact(syncToken)

    let syncDb = {}
    syncDb = await saveSyncContact(resArr)

    const {createdData,updatedData,deletedData} = syncDb.data

    const insertDb = await createSyncArr([...createdData,...updatedData])
    
    let bottom = 0,top = 0,index = 1,totalPeople = 0
    while (top < insertDb.length) {
        if (insertDb.length < (50*index)) top = insertDb.length
        else top = (index * 50)
        logger.debug('syncing start')
        const insert = insertDb.slice(bottom,top)
        await Contact.bulkCreate(insert, { updateOnDuplicate: ["nama","etag","namaKantor","alamat","notelp","raw"] })
        
        totalPeople = top
        logger.debug('syncing ' + totalPeople)
        bottom = top
        index++
    }
    logger.info('returning all data...')
    const report = {
        updatedData : updatedData.length,
        deletedData : deletedData.length,
        createdData : createdData.length,
    }
    response(res,true,{totalPeople, report,googleSync : resArr},'Berhasil mensinkronisasikan data',200)
    return logger.info('done')
}

const searchContact = async (req,res,next) => {
    const {param} = req.params
    const {value} = req.query
    let query
    if (value == "" || value == null || !value) return next(customError('query "value" dibutuhkan',400))
    switch (param) {
        case "nama":
            query = {nama : {[Op.like] : `%${value}%`}}
            break
        case "alamat": 
            query = {alamat : {[Op.like] : `%${value}%`}}
            break
        case "notelp": 
            query = {notelp : {[Op.like] : `%${value}%`}}
            break
        default:
            break
    }
    logger.info(`running search by ${param} : ${value}`)
    if (!query) return next(customError('param tidak valid',400))
    const contact = await Contact.findAll({
        attributes : {exclude : ['createdAt','updatedAt','deletedAt']},
        where : query,
        limit : 10  
    })
    response(res,true,contact,'Berhasil mendapatkan data pelanggan',200)
}

module.exports = {
    getAllContactGoogle,
    getAllContact,
    createContact,
    getSpesificContact,
    updateContact,
    deleteContact,
    syncContact,
    searchContact,
    syncContactFunc
}
