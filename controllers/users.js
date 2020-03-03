const usersRouter = require('express').Router()
const User = require('../models/user')
const jwt = require('jsonwebtoken')
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

// Temporary mock for login
usersRouter.get('/:username', async (request, response) => {
  const user = await User.findOne({username: request.params.username})

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, process.env.SECRET)

  response
    .status(200)
    .send({token, username: user.username, name: user.name})
})

module.exports = usersRouter