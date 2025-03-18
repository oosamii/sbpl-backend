import mongoose from 'mongoose'

const leadSchema = mongoose.Schema(
  {
    email: String,
    phone: String,
    password: String,
    firstName: String,
    middleName: String,
    lastName: String,
    dateOfBirth: Date,
    pincode: Number,
    state: String,
    trialCity: String,
    trialZone: String,
    playingRole: String,
    battingHandedness: String,
    bowlingHandedness: String,
    referralCode: String,
    paymentId: String,
    orderId: String,
    aadhaarNumber: String,
    selectCountry: String,
  },
  {
    timestamps: true,
  }
)

const Lead = mongoose.model('leads', leadSchema)

export default Lead
