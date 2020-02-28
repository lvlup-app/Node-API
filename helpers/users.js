const User = require('../models/user')
const jwt = require('jsonwebtoken')

const getUser = async (token) => {
  const decodedToken = jwt.verify(token, "secret")

  if(!token || !decodedToken.id){
    return response.status(401).json({error: 'token missing or invalid'})
  }

  const user = await User.findById(decodedToken.id)
  return user
}

const addSkill = async (user, skillId) => {
  user.skills = user.skills.concat(skillId)
  await user.save()
}

module.exports = {
  getUser,
  addSkill
}