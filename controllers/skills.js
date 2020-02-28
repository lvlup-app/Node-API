const skillsRouter = require('express').Router()
const helpers = require('../helpers/skills')

skillsRouter.get('/', async (request, response) => {
  const skills = await helpers.getSkills()
  response.json(skills)
})

skillsRouter.get('/:id', async (request, response) => {
  const skill = await helpers.getSkill(request.params.id)
  response.json(skill)
})

skillsRouter.post('/', async ({body}, response) => {  
  let {token, newSkill} = body

  try{
    const savedSkill = await helpers.createSkill(token, newSkill)
    response.status(201).json(savedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

skillsRouter.delete('/:id', async (request, response) => {
  await helpers.deleteSkill(request.params.id)
  response.status(204).end()
})

skillsRouter.put('/:id', async ({params, body}, response) => {
  try{
    const updatedSkill = await helpers.updateSkill(params.id, body)
    response.json(updatedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

module.exports = skillsRouter