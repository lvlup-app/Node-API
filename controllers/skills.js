const skillsRouter = require('express').Router()
const Skill = require('../models/skill')
const Battle = require('../models/battle')
const User = require('../models/user')
const jwt = require('jsonwebtoken')

skillsRouter.get('/', async (request, response) => {
  const skills = await Skill.find({})
  response.json(skills)
})

skillsRouter.get('/:id', async (request, response) => {
  const skill = await Skill.findOne({_id: request.params.id})
  response.json(skill)
})

skillsRouter.post('/', async (request, response) => {
  let token = request.body.token
  let skill = request.body.newSkill
  
  try{
    const decodedToken = jwt.verify(token, "secret")

    if(!token || !decodedToken.id){
      return response.status(401).json({error: 'token missing or invalid'})
    }

    const user = await User.findById(decodedToken.id)
  
    skill.curr_xp ? null : skill.curr_xp = 0
    skill.curr_lvl ? null : skill.curr_lvl = 0
  
    const newSkill = new Skill({...skill, user: user._id})
    const savedSkill = await newSkill.save()

    user.skills = user.skills.concat(savedSkill._id)
    await user.save()

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