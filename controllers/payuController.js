import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import Payu from 'payu-websdk'
import { v4 as uuidv4 } from 'uuid'

const payuClient = new Payu(
  {
    key: process.env.PAYU_KEY,
    salt: process.env.PAYU_SALT_TOKEN,
  },
  'LIVE'
)

export const initiatePayuPayment = asyncHandler(async (req, res) => {
  try {
    const { firstName, email, phone } = req.body

    const key = process.env.PAYU_KEY
    const salt = process.env.PAYU_SALT_TOKEN

    const amount = 10
    const txnId = uuidv4().replace(/-/g, '').substring(0, 20)
    const productinfo = 'Registration Fee for SBPL'

    const hashString = `${key}|${txnId}|${amount}|${productinfo}|${firstName}|${email}||||||||||||${salt}`

    const hash = crypto.createHash('sha512').update(hashString).digest('hex')

    const data = payuClient.paymentInitiate({
      isAmountFilledByCustomer: false,
      amount,
      currency: 'INR',
      firstName,
      email,
      phone,
      txnId,
      productinfo,
      surl: `https://sbpl-tc.com/paymentprocess/success/${txnId}`,
      furl: `https://sbpl-tc.com/paymentprocess/failed/${txnId}`,
      hash,
    })

    return res.send(data)
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})

export const getPaymentStatus = asyncHandler(async (req, res) => {
  try {
    const { txnId } = req.params

    const verifyData = await payuClient.verifyPayment(txnId)
    return res.status(200).json({
      success: true,
      verifyData,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})
