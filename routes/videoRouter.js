import express from 'express'
import {
  createVideo,
  deleteVideo,
  getAllVideos,
  updateVideo,
} from '../controllers/videoController.js'

const videoRouter = express.Router()

videoRouter.route('/create').post(createVideo)
videoRouter.route('/getAll').get(getAllVideos)
videoRouter.route('/update').post(updateVideo)
videoRouter.route('/delete/:videoId').delete(deleteVideo)

export default videoRouter
