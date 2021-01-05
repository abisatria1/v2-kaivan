const Op = require("sequelize").Op
// model
const GoogleToken = require("../models/GoogleToken")
const Contact = require("../models/Contact")

// helper contact
const {
  getContact,
  createGoogleContact,
  updateGoogleContact,
  saveSyncContact,
  deleteGoogleContact,
  createSyncArr,
} = require("../helpers/googleContact")

const getAllContactInDatabase = async () => {
  // next with pagination [x]
  const contact = await Contact.findAll()
  return contact
}

const createContact = async (contactRequestData = {}) => {
  // create google contact
  const contact = await createGoogleContact(contactRequestData)
  logger.debug("creating google contact")

  // assign to database
  const result = await Contact.create({
    ...contactRequestData,
    googleId: contact.resourceName,
    etag: contact.etag,
    raw: JSON.stringify(contact),
    notelp: contact.phoneNumbers[0].canonicalForm,
  })

  return result
}

const getSpesificContact = async (contactId) => {
  const contact = await Contact.findByPk(contactId)
  return contact
}

const updateContact = async (prevContact, newContactRequest) => {
  // update google contact
  const prev = ({ googleId, etag } = prevContact)
  const updateGoogle = await updateGoogleContact(prev, newContactRequest)

  await prevContact.update({
    ...newContactRequest,
    etag: updateGoogle.etag,
    raw: JSON.stringify(updateGoogle),
    notelp: updateGoogle.phoneNumbers[0].canonicalForm,
  })

  const result = await getSpesificContact(prevContact.googleId)
  return result
}

const deleteContact = async (contact) => {
  await deleteGoogleContact(contact.googleId)
  await contact.destroy()
  return {}
}

const searchContact = async (value) => {
  const contact = await Contact.findAll({
    attributes: { exclude: ["createdAt", "updatedAt", "deletedAt"] },
    where: {
      [Op.or]: [{ raw: { [Op.like]: `%${value}%` } }],
    },
    limit: 30,
  })

  return contact
}

const syncContactToDatabase = async () => {
  let resArr,
    syncDb = {},
    bottom = 0,
    top = 0,
    index = 1,
    totalPeople = 0

  const googleToken = await GoogleToken.findByPk(1)
  const syncToken = googleToken ? googleToken.syncToken : ""

  // fetching data from google
  // if sync token is expired fetch with no token
  resArr = await getGoogleContact(syncToken)
  if (!Array.isArray(resArr)) {
    logger.debug("fetching with no sync token")
    resArr = await getGoogleContact()
  }

  syncDb = await saveSyncContact(resArr)
  const { createdData, updatedData, deletedData } = syncDb.data
  const insertDb = await createSyncArr([...createdData, ...updatedData])

  while (top < insertDb.length) {
    if (insertDb.length < 50 * index) top = insertDb.length
    else top = index * 50

    logger.debug("syncing start")
    const insert = insertDb.slice(bottom, top)
    await Contact.bulkCreate(insert, {
      updateOnDuplicate: [
        "nama",
        "etag",
        "namaKantor",
        "alamat",
        "notelp",
        "raw",
      ],
    })
    totalPeople = top
    bottom = top
    index++
    logger.debug("syncing " + totalPeople)
  }

  const report = {
    updatedData: updatedData.length,
    deletedData: deletedData.length,
    createdData: createdData.length,
  }

  return {
    totalPeople,
    report,
    googleSync: resArr,
  }
}

const getGoogleContact = async (syncTokenParam = "") => {
  try {
    // fetching all data
    let result,
      i = 1,
      resArr = [],
      totalPeople = 0,
      nextPageToken,
      syncToken,
      nextSyncToken

    while (nextPageToken || i == 1) {
      result = await getContact({
        pageToken: nextPageToken,
        syncToken: syncTokenParam,
      })
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
        await GoogleToken.update({ syncToken: token }, { where: { id: 1 } })
        const obj = await GoogleToken.findByPk(1)
        if (obj) {
          await obj.update({ syncToken: token })
          logger.debug("updated sync token")
        } else {
          await GoogleToken.create({ syncToken: token })
          logger.debug("created sync token")
        }
      }
    }
    return resArr
  } catch (err) {
    return err
  }
}

module.exports = {
  syncContactToDatabase,
  getAllContactInDatabase,
  getGoogleContact,
  createContact,
  getSpesificContact,
  updateContact,
  deleteContact,
  searchContact,
}
