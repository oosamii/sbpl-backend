import express from 'express'
import {
  getPaymentStatus,
  initiatePayuPayment,
} from '../controllers/payuController.js'

const payuRouter = express.Router()

payuRouter.route('/initiatePayment').post(initiatePayuPayment)
payuRouter.route('/status/:txnId').get(getPaymentStatus)

export default payuRouter
