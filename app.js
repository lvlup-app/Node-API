const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
const bodyParser = require('body-parser')

mongoose
  .connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

app.use(cors())
app.use(bodyParser.json())

module.exports = app