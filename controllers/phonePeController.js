import axios from 'axios'
import asyncHandler from 'express-async-handler'
import { v4 as uuidv4 } from 'uuid'
import Secret from '../schemas/secretsSchema.js'

export const fetchLatestPhonePeAuthToken = asyncHandler(async (req, res) => {
  try {
    const response = await axios.post(
      'https://api.phonepe.com/apis/identity-manager/v1/oauth/token',
      new URLSearchParams({
        client_id: process.env.PHONEPE_CLIENT_ID,
        client_version: '1',
        client_secret: process.env.PHONEPE_SALT_KEY,
        grant_type: 'client_credentials',
      }).toString(),
      {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      }
    )

    if (response.data.access_token) {
      console.log('Recieved response from Phone Pe', response.data, new Date())
      await Secret.deleteMany({ type: 'O-Bearer' })
      const newToken = new Secret({
        token: response.data.access_token,
        type: 'O-Bearer',
        phoneResponse: JSON.stringify(response.data) ?? '',
      })
      await newToken.save()
      console.log('New token saved:', response.data.access_token)
      return response.data.access_token
    }
  } catch (error) {
    console.error('Error fetching token:', error.response?.data || error)
    return null
  }
})

export const initiatePayment = asyncHandler(async (req, res) => {
  try {
    const amount = 100000

    const secret = await Secret.findOne({ type: 'O-Bearer' }).sort({
      createdAt: -1,
    })

    if (!secret) {
      return res.status(500).json({ error: 'Auth token not found' })
    }

    let authToken = null

    const twentyMinutesAgo = new Date(Date.now() - 20 * 60 * 1000)

    if (!secret.updatedAt || secret.updatedAt < twentyMinutesAgo) {
      console.log('Token expired, fetching a new one...')
      const newAuthToken = await fetchLatestPhonePeAuthToken()
      if (!newAuthToken) {
        return res.status(500).json({ error: 'Failed to fetch new auth token' })
      }
      return newAuthToken
    }

    authToken = secret.token
    const merchantOrderId = uuidv4().replace(/-/g, '').substring(0, 20) // Generate unique order ID

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
      return res.json({
        status: 'success',
        paymentId: response.data.orderId,
        orderId: orderId,
      })
    } else {
      return res.json({ status: 'failed', state: response.data.state })
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
