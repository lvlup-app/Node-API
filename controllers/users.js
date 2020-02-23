const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')

usersRouter.post('/', async (request, response) => {
  try{
    const body = request.body

    if(!body.password){
      return response.status(400).json({error: 'password is required'})
    }

    if(body.password.length < 3){
      return response.status(400).json({error: 'password must be at least 3 characters long'})
    }

    const saltRounds = 10
    const passwordHash = await bcrypt.hash(body.password, saltRounds)

    const user = new User({
      username: body.username,
      passwordHash,
    })

    const savedUser = await user.save()
    response.status(201).json(savedUser)
  } catch(error){
    error.name === 'ValidationError'
      ? response.status(400).json({ error: error.message })
      : console.log(error)
  }
})

module.exports = usersRouter

/*
  * User schema & refs
  * Password hashing -> bcrypt
  * mongoose-unique-validator
  * mongoose populate()
  * Token auth -> jsonwebtoken
  * Limiting creating skills (battles) to logged in users
  * Error handling
*/