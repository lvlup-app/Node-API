const usersRouter = require('express').Router()
const { createUser, deleteUser } = require('../helpers/users')

usersRouter.post('/', async (request, response) => {
  try{
    const savedUser = await createUser(request.body)

    savedUser.error 
      ? response.status(400).json(savedUser)
      : response.status(201).json(savedUser)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

usersRouter.delete('/:id', async (request, response) => {
  await deleteUser(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter