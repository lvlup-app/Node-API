const Skill = require('../models/skill')
const User = require('../models/user')
const Battle = require('../models/battle')

const getSkill = async (id) => {
  const skill = await Skill.findById(id)
  return skill
}

const getAll = async (userId) => {
  const skills = await Skill.find({user: userId})
  return skills
}

const createSkill = async (skill, userId) => {
  skill.curr_xp ? null : skill.curr_xp = 0
  skill.curr_lvl ? null : skill.curr_lvl = 0

  const newSkill = new Skill({...skill, user: userId})
  const savedSkill = await newSkill.save()
  await _addToUser(userId, savedSkill.id)
  return savedSkill
}

const _addToUser = async (userId, id) => {
  const user = await User.findById(userId)
  user.skills = [...user.skills, id]
  await user.save()
}

const deleteSkill = async (id) => {
  const skill = await Skill.findById(id)
  await _deleteBattlesOf(skill)
  await _removeFromUser(skill.user, id)
  await skill.remove()
}

const updateSkill = async (id, skill) => {
  const updatedSkill = await Skill.findByIdAndUpdate(id, skill, {new: true})
  return updatedSkill
}

const _deleteBattlesOf = async (skill) => {
  let promises = skill.battles.map(async (battleId) => await Battle.findByIdAndRemove(battleId))
  await Promise.all(promises)
}
    
const _removeFromUser = async (userId, id) => {
  const user = await User.findById(userId)
  user.skills = user.skills.filter(skill => String(skill) !== id)
  await user.save()
}

module.exports = {
  getSkill,
  getAll,
  createSkill,
  deleteSkill,
  updateSkill
}