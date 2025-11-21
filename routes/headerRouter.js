import express from 'express'

import {
  createHeader,
  deleteHeader,
  getAllHeaders,
  getAllNoPage,
  getHeaderById,
  updateHeader,
} from '../controllers/headerController.js'

const headerRouter = express.Router()

headerRouter.route('/create').post(createHeader)
headerRouter.route('/getAll').get(getAllHeaders)
headerRouter.route('/update').post(updateHeader)
headerRouter.route('/delete/:headerId').delete(deleteHeader)
headerRouter.route('/getHeaderById/:id').get(getHeaderById)
headerRouter.route('/getAllNoPage').get(getAllNoPage)

export default headerRouter
