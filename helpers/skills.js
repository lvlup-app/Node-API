const Skill = require('../models/skill')
const Battle = require('../models/battle')
const { getUser, addSkill } = require('./users')

const getSkills = async () => Skill.find({})

const getSkill = async (id) => {
  const skill = await Skill.findById(id)
  return skill
}

const createSkill = async (token, skill) => {
  const user = await getUser(token)

  skill.curr_xp ? null : skill.curr_xp = 0
  skill.curr_lvl ? null : skill.curr_lvl = 0

  const newSkill = new Skill({...skill, user: user._id})
  const savedSkill = await newSkill.save()

  await addSkill(user, savedSkill._id)

  return savedSkill
}

const deleteSkill = async (id) => {
  await _deleteBattles(id)
  await Skill.findByIdAndRemove(id)
}

const updateSkill = async (id, skill) => {
  const updatedSkill = await Skill.findByIdAndUpdate(id, skill, {new: true})
  return updatedSkill
}

const addBattlesToSkill = async (id, battleId) => {
  const skill = await getSkill(id)
  skill.battles = [...skill.battles, battleId]
  await skill.save()
}

const removeBattlesFromSkill = async (id, battleId) => {
  const skill = await getSkill(id)
  skill.battles = skill.battles.filter(battle => String(battle) !== battleId)
  await skill.save()
}

const _deleteBattles = async (skillId) => {
  const battles = await Battle.find({skill: skillId})
  let promiseArray = battles.map(async (battle) => await battle.remove())
  await Promise.all(promiseArray)
}

module.exports = {
  getSkills,
  getSkill,
  createSkill,
  deleteSkill,
  updateSkill,
  addBattlesToSkill,
  removeBattlesFromSkill
}