const skillsRouter = require('express').Router()
const {getSkill, getAll, createSkill, deleteSkill, updateSkill} = require('../helpers/skills')

skillsRouter.get('/', async (request, response) => {
  const skills = await getAll(request.decoded.id)
  response.json(skills)
})

skillsRouter.get('/:id', async (request, response) => {
  const skill = await getSkill(request.params.id)
  response.json(skill)
})

skillsRouter.post('/', async (request, response, next) => {
  const userId = request.decoded.id
  let skill = request.body

  try{
    const savedSkill = await createSkill(skill, userId)
    response.status(201).json(savedSkill)
  } catch(error){
    next(error)
  }
})

skillsRouter.delete('/:id', async (request, response) => {
  await deleteSkill(request.params.id)
  response.status(204).end()
})

skillsRouter.put('/:id', async ({params, body}, response, next) => {
  try{
    const updatedSkill = await updateSkill(params.id, body)
    response.json(updatedSkill)
  } catch(error){
    next(error)
  }
})

module.exports = skillsRouter