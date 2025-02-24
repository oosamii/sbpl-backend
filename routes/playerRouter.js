import express from 'express'
import {
  continuePlayerRegistration,
  createGulfPlayer,
  createPlayer,
  fetchPlayersByStatus,
  fetchPlayersByStatusCSV,
  getAllGulfPlayers,
  getAllPlayers,
  getPlayerById,
  getPlayerByUser,
  getPlayerRegistrationsCount,
  getPlayersByState,
  getPlayersReportCSV,
  partialPlayerRegistration,
  recentRegisteration,
  searchPlayers,
  sendEmailToPlayers,
  usersWithoutPlayer,
} from '../controllers/playerController.js'

const playerRouter = express.Router()

playerRouter.route('/register').post(createPlayer)
playerRouter.route('/getByUser/:userId').get(getPlayerByUser)
playerRouter.route('/getAll').get(getAllPlayers)
playerRouter.route('/getById/:playerId').get(getPlayerById)
playerRouter.route('/getCountOfRegistrations').get(getPlayerRegistrationsCount)
playerRouter.route('/continueRegistration').post(continuePlayerRegistration)
playerRouter.route('/getByState/:state').get(getPlayersByState)
playerRouter.route('/searchPlayers').get(searchPlayers)
playerRouter.route('/downloadPlayersCsv').get(getPlayersReportCSV)
playerRouter.route('/recent').get(recentRegisteration)
playerRouter.route('/getPlayersByStatus').get(fetchPlayersByStatus)
playerRouter.route('/getPlayersByStatusCSV').get(fetchPlayersByStatusCSV)
playerRouter.route('/sendPlayerEmails').post(sendEmailToPlayers)
playerRouter.route('/usersWithoutPlayer').get(usersWithoutPlayer)
playerRouter.route('/partialRegistration').post(partialPlayerRegistration)

playerRouter.route('/registerGulfPlayer').post(createGulfPlayer);
playerRouter.route('/getAllGulfPlayers').get(getAllGulfPlayers);

export default playerRouter
