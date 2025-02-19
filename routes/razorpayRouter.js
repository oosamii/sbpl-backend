import express from 'express'
import { processPayment } from '../controllers/razorpayController.js'

const razorPayRouter = express.Router()

razorPayRouter.route('/processPayment').post(processPayment)

export default razorPayRouter
