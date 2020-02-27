const usersRouter = require('express').Router()
const User = require('../models/user')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const Skill = require('../models/skill')
const Battle = require('../models/battle')

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

/* Helper*/
const deleteBattles = async (skillId) => {
  const battles = await Battle.find({skill: skillId})
  let promiseArray = battles.map(async (b) => await b.remove())
  await Promise.all(promiseArray)
}

usersRouter.delete('/:id', async (request, response) => {
  const skills = await Skill.find({user: request.params.id})
  let promiseArray = skills.map(async (s) => {
    await deleteBattles(s.id)
    return await s.remove()
  })
  await Promise.all(promiseArray)

  await User.findByIdAndRemove(request.params.id)
  response.status(204).end()
})

usersRouter.get('/:username', async (request, response) => {
  const user = await User.findOne({username: request.params.username})

  const userForToken = {
    username: user.username,
    id: user._id,
  }

  const token = jwt.sign(userForToken, "secret")

  response
    .status(200)
    .send({token, username: user.username, name: user.name})
})

module.exports = usersRouter

/*
  * mongoose populate()
  * Limiti creating skills (battles) to logged in users
  * Error handling
*/