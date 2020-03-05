const skillsRouter = require('express').Router()
const {getSkill, getAll, createSkill, deleteSkill, updateSkill} = require('../helpers/skills')
const jwt = require('jsonwebtoken')

const getTokenFrom = (request) => {
  const authorization = request.get('Authorization')
  
  if(authorization && authorization.toLowerCase().startsWith('bearer ')){
    return authorization.substring(7)
  }

  return null
}

skillsRouter.get('/', async (request, response) => {
  const skills = await getAll(request.decoded.id)
  response.json(skills)
})

skillsRouter.get('/:id', async (request, response) => {
  const skill = await getSkill(request.params.id)
  response.json(skill)
})

skillsRouter.post('/', async (request, response) => {
  const token = getTokenFrom(request)
  let skill = request.body

  try{
    const decodedToken = jwt.verify(token, process.env.SECRET)
    const savedSkill = await createSkill(skill, decodedToken.id)
    response.status(201).json(savedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

skillsRouter.delete('/:id', async (request, response) => {
  await deleteSkill(request.params.id)
  response.status(204).end()
})

skillsRouter.put('/:id', async ({params, body}, response) => {
  try{
    const updatedSkill = await updateSkill(params.id, body)
    response.json(updatedSkill)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

module.exports = skillsRouter