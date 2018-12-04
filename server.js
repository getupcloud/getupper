const fs = require('fs')
const express = require('express')
const passport = require('passport')
const mongoose = require('mongoose')

const env = process.env.NODE_ENV || 'development'
const config = require('./config/config')[env]
const auth = require('./config/middlewares/authorization')

const app = express()
const port = process.env.PORT || 3000

mongoose.Promise = Promise
mongoose.connect(config.db, {
  keepAlive: true,
  reconnectTries: Number.MAX_VALUE,
  useMongoClient: true
})

const models_path = `${__dirname}/app/models`
fs.readdirSync(models_path).forEach(file => {
  require(`${models_path}/${file}`)
})

require('./config/passport')(passport, config)
require('./config/express')(app, config, passport)
require('./config/routes')(app, passport, auth)

app.listen(port)
console.log('Express app started on port ' + port)
exports = module.exports = app
