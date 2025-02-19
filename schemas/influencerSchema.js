import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const influencerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
      unique: true,
    },
    referrals: {
      type: Number,
      required: true,
      default: 0,
    },
    referralCode: {
      type: String,
      required: true,
      unique: true,
    },
    instagramId: reqString,
    city: reqString,
    state: reqString,
  },
  {
    timestamps: true,
  }
)
const Influencer = mongoose.model('influencers', influencerSchema)

export default Influencer
