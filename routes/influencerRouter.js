import express from 'express'
import {
  createInfluencer,
  getAllInfluencers,
  getInfluencerByUser,
} from '../controllers/influencerController.js'

const influencerRouter = express.Router()

influencerRouter.route('/create').post(createInfluencer)
// influencerRouter.route('/getById/:influencerId').get(createInfluencer)
influencerRouter.route('/getAll').get(getAllInfluencers)
influencerRouter.route('/getByUser/:userId').get(getInfluencerByUser)
export default influencerRouter
