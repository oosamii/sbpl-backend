import express from 'express'
import {
  createInfluencer,
  getAllInfluencers,
  getInfluencerByUser,
  getTopKInfluencer,
  getTotalCountOfInfluencer,
  getTotalReferrals,
  searchInfluencers,
} from '../controllers/influencerController.js'

const influencerRouter = express.Router()

influencerRouter.route('/create').post(createInfluencer)
// influencerRouter.route('/getById/:influencerId').get(createInfluencer)
influencerRouter.route('/getAll').get(getAllInfluencers)
influencerRouter.route('/getByUser/:userId').get(getInfluencerByUser)
influencerRouter.route('/getTotalCount').get(getTotalCountOfInfluencer)
influencerRouter.route('/getTopKInfluencer').get(getTopKInfluencer)
influencerRouter.route('/getTotalReferrals').get(getTotalReferrals)
influencerRouter.route('/searchInfluencers').get(searchInfluencers)
export default influencerRouter
