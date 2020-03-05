const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')
const loginRouter = require('express').Router()
const User = require('../models/user')

loginRouter.post('/', async (request, response, next) => {
  const {username, password} = request.body

  try{
    const user = await _validate(username, password)
  
    const userForToken = {
      username: user.username,
      id: user._id,
    }
    const token = jwt.sign(userForToken, process.env.SECRET)
  
    response
      .status(200)
      .send({token, username: user.username, name: user.name})
  } catch(error){
    next(error)
  }
})

const _validate = async (username, password) => {
  if(!username || !password){
    throw {
      name: "ValidationError",
      message: "username or password missing"
    }
  }

  const user = await User.findOne({username})
  const passwordCorrect = user === null
    ? false
    : await bcrypt.compare(password, user.passwordHash)

  if(!(user && passwordCorrect)) {
    throw {
      name: "AuthorizationError",
      message: "invalid username or password"
    }
  }

  return user
}

module.exports = loginRouter