import express from 'express'
import {
  getPaymentStatus,
  initiatePayuPayment,
  paymentCallback,
} from '../controllers/payuController.js'

const payuRouter = express.Router()

payuRouter.route('/initiatePayment').post(initiatePayuPayment)
payuRouter.route('/status/:txnId').get(getPaymentStatus)
payuRouter.route('/callback/:txnId').post(paymentCallback)

export default payuRouter
