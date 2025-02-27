import bodyParser from 'body-parser'
import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
dotenv.config()

const port = process.env.PHONE_PORT || 4001

const app = express()

app.use(bodyParser.json({ extended: true }))
app.use(bodyParser.urlencoded({ extended: true }))

app.use(
  cors({
    origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  })
)

app.post('/create-order', async (req, res) => {
  const {} = req.body
})

app.listen(port, (req, res) => {
  console.log(`Phone pe Server is listening on port ${port}`)
})
