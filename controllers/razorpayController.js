import asyncHandler from 'express-async-handler'
import Razorpay from 'razorpay'

export const processPayment = asyncHandler(async (req, res) => {
  const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || 'rzp_test_L7RMyHLVoAn1cd',
    key_secret: process.env.RAZORPAY_KEY_SECRET || 'E4Hor8lIO3DgqNe31QhAFhOQ',
  })

  const options = {
    amount: req.body.amount,
    currency: req.body.currency,
    receipt: req.body.orderId,
    payment_capture: 1,
  }

  try {
    const response = await razorpay.orders.create(options)
    console.log(response)
    res.json({
      order_id: response.id,
      currency: response.currency,
      amount: response.amount,
    })
  } catch (err) {
    console.log(err)
    res.status(400).send('Not able to create order. Please try again!')
  }
})
