import express from 'express'
import {
  createPlayer,
  getAllPlayers,
  getPlayerById,
  getPlayerByUser,
} from '../controllers/playerController.js'

const playerRouter = express.Router()

playerRouter.route('/register').post(createPlayer)
playerRouter.route('/getByUser/:userId').get(getPlayerByUser)
playerRouter.route('/getAll').get(getAllPlayers)
playerRouter.route('/getById/:playerId').get(getPlayerById)

export default playerRouter
