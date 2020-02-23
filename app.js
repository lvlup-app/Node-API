const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const skillsRouter = require('./controllers/skills')
const battlesRouter = require('./controllers/battles')
const usersRouter = require('./controllers/users')

mongoose
  .connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false,
    useCreateIndex: true
  })
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

app.use(cors())
app.use(bodyParser.json())
app.use('/skills', skillsRouter)
app.use('/skills', battlesRouter)
app.use('/users', usersRouter)

module.exports = app