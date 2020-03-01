const User = require('../models/user')
const bcrypt = require('bcrypt')
const { deleteSkill } = require('./skills')

/* const _decode = (token) => {
  const decodedToken = jwt.verify(token, "secret")

  if(!token || !decodedToken.id){
    return response.status(401).json({error: 'token missing or invalid'})
  }
}

const getUser = async (token) => {
  const user = await User.findById(decodedToken.id)
  return user
} */

const createUser = async ({username, password}) => {
  if(!password) return {error: 'password is required'}
  if(password.length < 3) return {error: 'password must be at least 3 characters long'}

  const saltRounds = 10
  const passwordHash = await bcrypt.hash(password, saltRounds)

  const user = new User({
    username,
    passwordHash,
  })

  const savedUser = await user.save()
  return savedUser
}

const deleteUser = async (id) => {
  const user = await User.findById(id)

  let promises = user.skills.map(async (skillId) => await deleteSkill(skillId))
  await Promise.all(promises)

  await User.findByIdAndRemove(id)
}

module.exports = {
  createUser,
  deleteUser
}
