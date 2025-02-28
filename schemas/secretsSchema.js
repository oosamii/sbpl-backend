import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const secretsSchema = mongoose.Schema(
  {
    token: reqString,
    type: reqString,
    phoneResponse: reqString,
  },
  {
    timestamps: true,
  }
)

const Secret = mongoose.model('secrets', secretsSchema)

export default Secret
