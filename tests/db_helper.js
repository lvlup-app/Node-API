const Skill = require('../models/skill')
const Battle = require('../models/battle')
const User = require('../models/user')

/**
 * Creates documents from array and saves them to the database
 * @param {Array} data 
 * @param {string} model 
 */
const initAll = async (data, model) => {
  const Model = _checkModel(model)
  await Model.deleteMany({})
  let promiseArray = data.map(async (item) => { 
    let document = new Model(item)
    await document.save()
  })

  await Promise.all(promiseArray)
}

/**
 * Creates a new document and saves it to the database
 * @param {Object} data 
 * @param {string} model 
 */
const initOne = async (data, model) => {
  const Model = _checkModel(model)
  await Model.deleteMany({})
  const document = new Model(data)
  await document.save()
}

/**
 * Returns all documents of a collection
 * @param {string} model 
 */
const getDocuments = async (model) => {
  const Model = _checkModel(model)
  const documents = await Model.find({})
  return documents.map(document => document.toJSON())
}

/**
 * Returns document found by id
 * @param {string} id 
 * @param {string} model 
 */
const getDocument = async (id, model) => {
  const Model = _checkModel(model)
  const document = await Model.findById(id)
  return document.toJSON()
}

/**
 * Returns all documents from a collection based on the condition
 * @param {Object} condition - { field: value }
 * @param {string} model 
 */
const getDocumentsBy = async (condition, model) => {
  const Model = _checkModel(model)
  const documents = await Model.find(condition)
  return documents.map(document => document.toJSON())
}

const _checkModel = (model) => {
  switch(model){
    case "Skill":
      return Skill
    case "Battle":
      return Battle
    case "User":
      return User
  }
}

module.exports = {
  initAll,
  initOne,
  getDocuments,
  getDocument,
  getDocumentsBy
}