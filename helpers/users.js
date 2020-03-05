const User = require('../models/user')
const bcrypt = require('bcrypt')
const { deleteSkill } = require('./skills')

const createUser = async ({username, password}) => {
  _checkPassword(password)
  
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

const _checkPassword = (password) => {
  if(!password) throw {
    name: 'ValidationError',
    message: 'password is required'
  }
  
  if(password.length < 3) throw {
    name: 'ValidationError',
    message: 'password must be at least 3 characters long'
  }
}

module.exports = {
  createUser,
  deleteUser
}
