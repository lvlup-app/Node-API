const config = require('./utils/config')
const express = require('express')
const app = express()
const mongoose = require('mongoose')

mongoose
  .connect(config.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .catch((error) => console.log('error connecting to MongoDB:', error.message))

module.exports = app