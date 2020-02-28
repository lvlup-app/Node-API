const Battle = require('../models/battle')
const { addBattlesToSkill, removeBattlesFromSkill } = require('./skills')

const getBattles = async (skillId) => {
  const battles = await Battle.find({skill: skillId})
  return battles
}

const getBattle = async (id) => {
  const battle = await Battle.findById(id)
  return battle
}

const createBattle = async (battle, skillId) => {
  const newBattle = new Battle({...battle, skill: skillId})
  const savedBattle = await newBattle.save()
  
  await addBattlesToSkill(skillId, savedBattle._id)

  return savedBattle
}

const deleteBattle = async (id, skillId) => {
  await removeBattlesFromSkill(skillId, id)
  await Battle.findByIdAndRemove(id)
}

module.exports = {
  getBattles,
  getBattle,
  createBattle,
  deleteBattle
}