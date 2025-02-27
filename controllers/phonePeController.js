import axios from 'axios'
import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import { handleErrorResponse } from '../utils/responseHandlers.js'

export const initiatePayment = asyncHandler(async (req, res) => {
  const MERCHANT_ID = 'M22UNPVPNQDCM'
  const SALT_KEY = '13a08676-49a3-4cfa-87d5-4853dbb1cd31'
  const SALT_INDEX = 1
  const PHONEPE_BASE_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox'
  try {
    const { username, amount, mobile } = req.body
    console.log(MERCHANT_ID, SALT_KEY, SALT_INDEX, PHONEPE_BASE_URL, 'Secrets')
    const transactionId = `TXN-${Date.now()}`

    const payload = {
      merchantId: MERCHANT_ID,
      merchantTransactionId: transactionId,
      merchantUserId: 'MUID123',
      amount: 10000,
      redirectUrl: 'https://webhook.site/redirect-url',
      redirectMode: 'REDIRECT',
      callbackUrl: 'https://webhook.site/callback-url',
      mobileNumber: '9999999999',
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    }
    console.log(payload, 'Payment Payload')

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString(
      'base64'
    )

    console.log(encodedPayload, 'Encoded Payload')

    const string = encodedPayload + '/pg/v1/pay' + SALT_KEY

    const sha256 = crypto.createHash('sha256').update(string).digest('hex')

    const checksum = sha256 + '###' + SALT_INDEX

    console.log(checksum, 'Checksum')

    const response = await axios.post(
      `${PHONEPE_BASE_URL}/pg/v1/pay`,
      { request: encodedPayload },
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
          accept: 'application/json',
        },
      }
    )

    res.json(response.data)
  } catch (error) {
    console.log(error, 'While initiating payment')
    return handleErrorResponse(res, error)
  }
})

export const paymentCallback = asyncHandler(async (req, res) => {
  console.log('Payment Callback Received:', req.body)
  res.status(200).send('Callback received')
})

export const checkPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { transactionId } = req.params

    const checksum =
      crypto
        .createHash('sha256')
        .update(`/pg/v1/status/${MERCHANT_ID}/${transactionId}` + SALT_KEY)
        .digest('hex') + `###${SALT_INDEX}`

    const response = await axios.get(
      `${PHONEPE_BASE_URL}/pg/v1/status/${MERCHANT_ID}/${transactionId}`,
      {
        headers: {
          'Content-Type': 'application/json',
          'X-VERIFY': checksum,
        },
      }
    )
    console.log('Phone pe response', response.data)

    res.json(response.data)
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})
