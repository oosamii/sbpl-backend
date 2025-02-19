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
    address: reqString,
    state: reqString,
    city: reqString,
    locality: reqString,
    pincode: reqString,
    landmark: reqString,
    currentAddress: reqString,
    currentState: reqString,
    currentCity: reqString,
    currentLocality: reqString,
    currentPincode: reqString,
    currentLandmark: reqString,
    aadhaarNumber: reqString,
    emergencyContact: String,
    instagramId: String,
    facebookId: String,
    aadhaarImage: reqString,
    trouserSize: reqString,
    tshirtSize: reqString,
    shoeSize: reqString,
    bloodGroup: reqString,
    playingRole: {
      type: String,
      enum: ['BATSMAN', 'BOWLER', 'ALL-ROUNDER'],
      required: true,
    },
    prefferedBattingOrder: String,
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
    numberOfRegistrations: Number,
    status: {
      type: String,
      enum: ['INITIATED', 'DETAILS_FILLED', 'REGISTERED'],
      default: 'INITIATED',
    },
  },
  {
    timestamps: true,
  }
)

const Player = mongoose.model('players', playerSchema)

export default Player
