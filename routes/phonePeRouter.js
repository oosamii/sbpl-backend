import express from 'express'
import {
  checkPaymentStatus,
  initiatePayment,
  paymentCallback,
} from '../controllers/phonePeController.js'

const phonePeRouter = express.Router()

phonePeRouter.route('/initiatePayment').post(initiatePayment)
phonePeRouter.route('/payment/callback').get(paymentCallback)
phonePeRouter.route('/paymentStatus/:orderId').get(checkPaymentStatus)

export default phonePeRouter
