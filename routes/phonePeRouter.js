import express from 'express'
import {
  checkPaymentStatus,
  fetchLatestPhonePeAuthToken,
  initiatePayment,
  paymentCallback,
} from '../controllers/phonePeController.js'

const phonePeRouter = express.Router()

phonePeRouter.route('/initiatePayment').post(initiatePayment)
phonePeRouter.route('/payment/callback').get(paymentCallback)
phonePeRouter.route('/payment/callback').post(paymentCallback)
phonePeRouter.route('/paymentStatus/:orderId').get(checkPaymentStatus)
phonePeRouter.route('/generateToken').post(fetchLatestPhonePeAuthToken)

export default phonePeRouter
