import express from 'express'

import {
  createHighlight,
  deleteHighlight,
  getAllHighlights,
  getAllNoPage,
  getHighlightById,
  toggleTopHighlight,
  updateHighlight,
} from '../controllers/highlightController.js'

const highlightRouter = express.Router()

highlightRouter.route('/create').post(createHighlight)
highlightRouter.route('/getAll').get(getAllHighlights)
highlightRouter.route('/update').post(updateHighlight)
highlightRouter.route('/delete/:highlightId').delete(deleteHighlight)
highlightRouter.route('/getHighlightById/:id').get(getHighlightById)
highlightRouter.route('/getAllNoPage').get(getAllNoPage)
highlightRouter.route('/toggleTopHighlight').post(toggleTopHighlight)

export default highlightRouter;
