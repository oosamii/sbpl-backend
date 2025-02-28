import Agenda from 'agenda'
import axios from 'axios'
import mongoose from 'mongoose'
import Secret from './schemas/secretsSchema.js'

const dbConnection = mongoose.connection
dbConnection.on('error', (err) => console.log(`Connection error ${err}`))
dbConnection.once('open', () => console.log('Connected to DB!'))

const mongooseConnection = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI)
    console.log(`MongoDB Connected: ${conn.connection.host}`)

    // Initialize and Start Agenda after DB is connected
    const agenda = new Agenda({ db: { address: process.env.MONGO_URI } })

    agenda.define('fetch-token', async () => {
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
          console.log(
            'Recieved response from Phone Pe',
            response.data,
            new Date()
          )
          await Secret.deleteMany({ type: 'O-Bearer' })
          const newToken = new Secret({
            token: response.data.access_token,
            type: 'O-Bearer',
            phoneResponse: JSON.stringify(response.data) ?? '',
          })
          await newToken.save()
          console.log('New token saved:', response.data.access_token)
        }
      } catch (error) {
        console.error('Error fetching token:', error.response?.data || error)
      }
    })

    await agenda.start()
    await agenda.every('20 minutes', 'fetch-token')

    console.log('Agenda job scheduled.')
  } catch (error) {
    console.log(`error :${error.message}`)
    process.exit(1)
  }
}

export default mongooseConnection
