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
    trialCity: String,
    trialZone: String,
    address: String,
    state: String,
    city: String,
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
    selectCountry: {
      type: String,
      enum: [
        "KSA",
        "Kuwait",
        "Qatar",
        "Bahrain",
        "Oman",
        "UAE"]
    },
    selectState: {
      type: String,
      enum: [
        "Karnataka",
        "Kerala",
        "Tamil Nadu",
        "Goa",
        "Andhra Pradesh",
        "Telangana"
      ]
    },
    playingRole: {
      type: String,
      enum: ['BATSMAN', 'BOWLER', 'ALL-ROUNDER'],
      required: true,
    },
    prefferedBattingOrder: String,
    battingStyle: String,
    bowlingStyle: String,
    battingHandedness: String,
    bowlingHandedness: String,
    referralCode: String,
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
    paymentId: String,
    gulfPlayer: {
      type: Boolean,
      default: false
    }
  },
  {
    timestamps: true,
  }
)

const Player = mongoose.model('players', playerSchema)

export default Player
