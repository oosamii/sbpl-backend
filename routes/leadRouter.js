import express from 'express'
import {
  createLead,
  downloadCsv,
  getAllLeads,
  getLeadById,
} from '../controllers/leadController.js'

const leadRouter = express.Router()

leadRouter.route('/create').post(createLead)
leadRouter.route('/getAll').get(getAllLeads)
leadRouter.route('/getById/:leadId').get(getLeadById)
leadRouter.route('/downloadCsv').get(downloadCsv)

export default leadRouter
