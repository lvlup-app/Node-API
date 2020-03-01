const Battle = require('../models/battle')
const Skill = require('../models/skill')

const getBattle = async (id) => {
  const battle = await Battle.findById(id)
  return battle
}

const getAll = async (skillId) => {
  const battles = await Battle.find({skill: skillId})
  return battles
}

const createBattle = async (battle, skillId) => {
  const newBattle = new Battle({...battle, skill: skillId})
  const savedBattle = await newBattle.save()
  await _addToSkill(skillId, savedBattle.id)
  return savedBattle
}

const _addToSkill = async (skillId, id) => {
  const skill = await Skill.findById(skillId)
  skill.battles = [...skill.battles, id]
  await skill.save()
}

const deleteBattle = async (skillId, id) => {
  await _removeFromSkill(skillId, id)
  await Battle.findByIdAndRemove(id)
}

const _removeFromSkill = async (skillId, id) => {
  const skill = await Skill.findById(skillId)
  skill.battles = skill.battles.filter(battle => String(battle) !== id)
  await skill.save()
}

module.exports = {
  getBattle,
  getAll,
  createBattle,
  deleteBattle
}