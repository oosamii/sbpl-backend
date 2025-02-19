import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const playerSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'users',
      required: true,
    },
    firstName: reqString,
    middleName: String,
    lastName: reqString,
    dateOfBirth: { type: Date, required: true },
    trialCity: reqString,
    trialZone: reqString,
    address: String,
    state: reqString,
    city: reqString,
    locality: String,
    pincode: String,
    landmark: String,
    currentAddress: String,
    currentState: String,
    currentCity: String,
    currentLocality: String,
    currentPincode: String,
    currentLandmark: String,
    aadhaarNumber: String,
    emergencyContact: String,
    instagramId: String,
    facebookId: String,
    aadhaarImage: String,
    trouserSize: String,
    tshirtSize: String,
    shoeSize: String,
    bloodGroup: String,
    playingRole: {
      type: String,
      enum: ['BATSMAN', 'BOWLER', 'ALL-ROUNDER'],
      required: true,
    },
    prefferedBattingOrder: reqString,
    battingStyle: {
      type: String,
      enum: ['RIGHT-HANDED', 'LEFT-HANDED'],
      required: true,
    },
    bowlingStyle: {
      type: String,
      enum: ['SEAM', 'SPIN', 'N/A'],
    },
    dateOfRegistration: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'INITIATED',
        'PAYMENT_DONE',
        'DETAILS_FILLED',
        'SELECTED',
        'REJECTED',
      ],
      default: 'INITIATED',
    },
    influencer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'influencers',
    },
  },
  {
    timestamps: true,
  }
)

const Player = mongoose.model('players', playerSchema)

export default Player
