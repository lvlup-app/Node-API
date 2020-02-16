const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
  name: String,
  max_lvl: Number,
  curr_lvl: Number,
  curr_xp: Number
})

// toJSON

module.exports = mongoose.model('Skill', skillSchema)