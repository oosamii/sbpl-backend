import express from 'express'
import {
  continuePlayerRegistration,
  createPlayer,
  getAllPlayers,
  getPlayerById,
  getPlayerByUser,
  getPlayerRegistrationsCount,
} from '../controllers/playerController.js'

const playerRouter = express.Router()

playerRouter.route('/register').post(createPlayer)
playerRouter.route('/getByUser/:userId').get(getPlayerByUser)
playerRouter.route('/getAll').get(getAllPlayers)
playerRouter.route('/getById/:playerId').get(getPlayerById)
playerRouter.route('/getCountOfRegistrations').get(getPlayerRegistrationsCount)
playerRouter.route('/continueRegistration').post(continuePlayerRegistration)

export default playerRouter
