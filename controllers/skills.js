const skillsRouter = require('express').Router()
const Skill = require('../models/skill')

skillsRouter.get('/', async (request, response) => {
  const skills = await Skill.find({})
  response.json(skills)
})

skillsRouter.get('/:id', async (request, response) => {
  const skill = await Skill.findOne({_id: request.params.id})
  response.json(skill)
})

skillsRouter.post('/', async (request, response) => {
  try{
    let reqObj = request.body
  
    reqObj.curr_xp ? null : reqObj.curr_xp = 0
    reqObj.curr_lvl ? null : reqObj.curr_lvl = 0
  
    const skill = new Skill(reqObj)
    const savedSkill = await skill.save()
    response.status(201).json(savedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

module.exports = skillsRouter