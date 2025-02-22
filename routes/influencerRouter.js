import express from 'express'
import {
  createInfluencer,
  getAllInfluencers,
  getInfluencerByUser,
  getInfluencersReportCSV,
  getTopKInfluencer,
  getTotalCountOfInfluencer,
  getTotalReferrals,
  searchInfluencers,
  updateInfluencer,
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
influencerRouter.route('/downloadInfluencersCsv').get(getInfluencersReportCSV)
influencerRouter.route('/update/:influencerId').post(updateInfluencer)
export default influencerRouter
