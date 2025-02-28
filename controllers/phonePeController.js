import axios from 'axios'
import asyncHandler from 'express-async-handler'
import { v4 as uuidv4 } from 'uuid'
import Secret from '../schemas/secretsSchema.js'

export const initiatePayment = asyncHandler(async (req, res) => {
  try {
    const amount = 100000

    const secret = await Secret.findOne({ type: 'O-Bearer' }).sort({
      createdAt: -1,
    })

    if (!secret) {
      return res.status(500).json({ error: 'Auth token not found' })
    }

    const authToken = secret.token
    const merchantOrderId = uuidv4() // Generate unique order ID

    const payload = {
      merchantOrderId,
      amount,
      paymentFlow: {
        type: 'PG_CHECKOUT',
        message: 'Processing your payment',
        merchantUrls: {
          redirectUrl: 'https://sbpl-tc.com/payment-check/' + merchantOrderId,
        },
      },
    }

    const response = await axios.post(
      'https://api.phonepe.com/apis/pg/checkout/v2/pay',
      payload,
      {
        headers: {
          Authorization: `O-Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('Phone Pe response Checkout api', response.data)

    if (response.data && response.data.redirectUrl) {
      return res.json({
        success: true,
        orderId: response.data.orderId,
        redirectUrl: response.data.redirectUrl,
      })
    } else {
      throw new Error('Invalid response from PhonePe')
    }
  } catch (error) {
    console.error('Payment initiation error:', error.response?.data || error)
    return res.status(500).json({ error: 'Payment initiation failed' })
  }
})

export const paymentCallback = asyncHandler(async (req, res) => {
  console.log('Payment Callback Received Phone Pe:', req.body)
  res.status(200).send('Callback received')
})

export const checkPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { orderId } = req.params

    // Fetch latest auth token from DB
    const secret = await Secret.findOne({ type: 'O-Bearer' }).sort({
      createdAt: -1,
    })

    if (!secret) {
      return res.status(500).json({ error: 'Auth token not found' })
    }

    const authToken = secret.token

    const response = await axios.get(
      `https://api.phonepe.com/apis/pg/checkout/v2/order/${orderId}/status?details=false`,
      {
        headers: {
          Authorization: `O-Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log(response.data, 'Phone Pe Status response')

    if (response.data && response.data.state === 'COMPLETED') {
      return res.json({ status: 'success' })
    } else {
      return res.json({ status: 'failed' })
    }
  } catch (error) {
    console.error('Payment verification error:', error)
    return res.status(500).json({ error: 'Payment verification failed' })
  }
})

export const generateToken = asyncHandler(async (req, res) => {
  try {
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      error: error.message,
      success: false,
    })
  }
})
