const usersRouter = require('express').Router()
const { createUser, deleteUser } = require('../helpers/users')

usersRouter.post('/', async (request, response, next) => {
  try{
    const savedUser = await createUser(request.body)
    response.status(201).json(savedUser)
  } catch(error){
    next(error)
  }
})

usersRouter.delete('/:id', async (request, response) => {
  await deleteUser(request.params.id)
  response.status(204).end()
})

module.exports = usersRouter