const express = require('express')

const UserController = require('./app/controllers/UserController')
const SessionController = require('./app/controllers/SessionController')

const routes = express.Router()

routes.post('/users', UserController.store)
routes.post('/sessions', SessionController.store)

module.exports = routes
