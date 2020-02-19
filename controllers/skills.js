const skillsRouter = require('express').Router()
const Skill = require('../models/skill')
const Battle = require('../models/battle')

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

skillsRouter.delete('/:id', async (request, response) => {
  const battles = await Battle.find({skill: request.params.id})
  let promiseArray = battles.map(async (b) => await b.remove())
  await Promise.all(promiseArray)

  await Skill.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

skillsRouter.put('/:id', async (request, response) => {
  try{
    const skill = request.body
    const updatedSkill = await Skill.findByIdAndUpdate(request.params.id, skill, {new: true})
    response.json(updatedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

module.exports = skillsRouter