const mongoose = require('mongoose')

const skillSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  max_lvl: {
    type: Number,
    required: true
  },
  curr_lvl: Number,
  curr_xp: Number,
  battles: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Battle'
    }
  ],
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

skillSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
  }
})

module.exports = mongoose.model('Skill', skillSchema)