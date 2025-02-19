import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const influencerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    referrals: Number,
  },
  {
    timestamps: true,
  }
)
const Influencer = mongoose.model('influencers', influencerSchema)

export default Influencer
