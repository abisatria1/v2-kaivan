// models
const Partner = require("../models/Partner")
const Contact = require("../models/Contact")

const getAllPartner = async () => {
  return await Partner.findAll({
    include: [
      {
        model: Contact,
        attributes: { exclude: ["createdAt", "updatedAt", "deletedAt", "raw"] },
      },
    ],
  })
}

const createPartner = async (contact, partnerRequestData) => {
  return await Partner.create({
    ...partnerRequestData,
    contactGoogleId: contact.googleId,
  })
}

const getSpesificPartner = async (partnerId) => {
  return await Partner.findOne({
    where: { id: partnerId },
    include: [Contact],
  })
}

const updatePartner = async (prevPartner, newPartner) => {
  return await prevPartner.update(newPartner)
}

const deletePartner = async (partner) => {
  await partner.destroy()
  return {}
}

module.exports = {
  getAllPartner,
  createPartner,
  getSpesificPartner,
  updatePartner,
  deletePartner,
}
