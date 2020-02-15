/* Express */
const express = require('express')
const app = express()

/* Env Vars */
require('dotenv').config()

const PORT = process.env.PORT
const MONGO_URL = process.env.MONGO_URL

/* Mongoose */
const mongoose = require('mongoose')

mongoose
  .connect(MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

const skillSchema = new mongoose.Schema({
  name: String,
  max_lvl: Number,
  curr_lvl: Number,
  curr_xp: Number
})

const Skill = mongoose.model('Skill', skillSchema)

skill.save().then((result) => {
  console.log('saved!')
  mongoose.connection.close()
})

/* Server Start */
app.listen(PORT, () => console.log(`Server running on port ${PORT}`))
