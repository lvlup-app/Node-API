const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')
const middleware = require('./utils/middleware')
const skillsRouter = require('./controllers/skills')
const battlesRouter = require('./controllers/battles')
const usersRouter = require('./controllers/users')
const loginRouter = require('./controllers/login')

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
app.use('/skills', middleware.tokenValidator, skillsRouter)
app.use('/skills', middleware.tokenValidator, battlesRouter)
app.use('/users', usersRouter)
app.use('/login', loginRouter)

module.exports = app