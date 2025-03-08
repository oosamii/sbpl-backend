import crypto from 'crypto'
import asyncHandler from 'express-async-handler'
import Payu from 'payu-websdk'
import { v4 as uuidv4 } from 'uuid'

const payuClient = new Payu(
  {
    key: 'TOTKCy',
    salt: 'MIIEvQIBADANBgkqhkiG9w0BAQEFAASCBKcwggSjAgEAAoIBAQDYcUNuqvxYZ5uwSqPFbCOyaeWo0KJZzkTHBiRKyQGNlvJlZsheFNr18F7gj5fax1C10W66eOnV4KMVIYHnryBhAZbz8obPC+c19szrKfK1SzR7WTFD+iopwOXtKe66GrQA32pWchn4KbxkyMIBMJc8NYLzxSKgSmR7twdsCoT2yxtj4DO4QgnrSnD0pgxA3MdOKaMtdnaT4E2u0m7f6SgUF7/BI4KgmDeC/YeQzgnPGFN/M8andhDf91KQxzI0KPjBvaHMAvqlsAlS/FQWnyKv6WEJ/orCtEst6aYZYjDmU7QZsb4W2wss53REHTtfjkerUybYp548W6b7ydtQp84lAgMBAAECggEABod8KkV8MUqG1s2ZnSYC+anaJLqOezkOuBZGV/8yTcwk6cws9TGZ3Vtv8URDp3TlyWZU+ckV/L63DLcjDRMqXeLHY/qH+Iz6X5VfXyS3zqJDJgltxAgy52mLRhlCu1h8353dvlfY0rSnmz63I4QMu+M9XQ8wWTeFSnod/jNfCXbO22l9CFtdF40lM41qeZlDMdhBJBk5hUy8FSOSbjxvF6gnZwq486fPn179MjlGtrcaScZ4grTHVFLHzx+24MSExyTMNCBhVwwPMLJVZenqUgqQFzT7jSqf8nmOZCsO8GYKuwd19xUxmMy6mSLE1D59tXSNrH0Eft6QQr978C2p4QKBgQDvum/H0eOqyD+0vk6IpOLFLwyg+jsXMhUtHnRdyYx75bh86Liu/8D3LEyEcbdYse5IgpHV5SKV1tmpTD6BIbr4re9aPjzazwH/QNosnqErXJ+PEcatQKrwiABa52i+M/3tL1t16J0vFlvkh1HLOQCyOUyvxpGXtlpBq6rP0j8SyQKBgQDnIjUv92jufgrEaMM+2UJKO6wYjlhMR3levC3z2QBvDO6ZD03zkCrdg83Ql9dAEi5x8k3+l22A2XMbXCmlfCvCvkS3klwkULyC6nEhWcfPMHiMdrg4Y9e+uvPt3oZyoy/zD9012i7AP642iXguXlJIqlGufJDpqXpSXgJ3632SfQKBgC6M72PH2AOzutsoESvriLVte3BO5uaMLRyDy2ji2Eq+wuJOdn5U322fxoP5aPbqJjEiWZtFUT/zZnS/f2un1xyu+cl2SG7cv7CHMVZ0vysiY0Fu3DuMUSU/44HDac11XxuNlJ8CunMITnPD6xghS4dQJRoE3wSsvj3+Tb7pPqIxAoGBALXSiCqyo14x0wCNNUKkoGxLIueyWq2u8EBhInkYNSom7y+DBZxbxgy6GddFC3SAmP7UURy9PMxGwzE7wBtJYhdxnBcY0NlUlecazGIjAXbwt3QwFF1v1ZFZ+ngePH/D9f1sdmVdvLdJoR+P5vX7BxnYuibcIRdfVjWjdKenngH1AoGAQ38XlyUYs36nndyrYJk+Wyom0GgwxsSZ59x6yOV3kaTIYJqo8rjRnGGa4lo2WD/blRWhSFaQOcn/mrspVltDxwZSXbJTKBybCkX2O6qwRY5kNJ+IAdrEOvxqN9NP4SJ0pygNQWJePpStTfgD3dBTCMXK++gQSEkDf225ExadZcU=',
  },
  'PROD'
)

export const initiatePayuPayment = asyncHandler(async (req, res) => {
  try {
    const { firstName, email, phone } = req.body

    const key = process.env.PAYU_KEY
    const salt = process.env.PAYU_SALT_TOKEN

    const amount = 1000
    const txnid = uuidv4().replace(/-/g, '').substring(0, 20)
    const productinfo = 'Registration Fee for SBPL'

    const hashString = `${key}|${txnid}|${amount}|${productinfo}|${firstName}|${email}||||||||||||${salt}`

    const hash = crypto.createHash('sha512').update(hashString).digest('hex')

    const data = payuClient.paymentInitiate({
      isAmountFilledByCustomer: false,
      amount,
      currency: 'INR',
      firstname: firstName,
      email,
      phone,
      txnid,
      productinfo,
      surl: `https://sbpl-tc.com/paymentprocess/success/${txnid}`,
      furl: `https://sbpl-tc.com/paymentprocess/failed/${txnid}`,
      hash,
    })

    console.log(`Initiated Transaction for id:${txnid}`)

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
    const data = verifyData.transaction_details[txnId]
    return res.status(200).json({
      success: true,
      status: data.status,
      amount: data.amt,
      txnid: data.txnid,
      method: data.mode,
      error: data.error_Message,
      createdAt: new Date(data.addedon).toLocaleString(),
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      error: error.message,
    })
  }
})
