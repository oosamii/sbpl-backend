import bcrypt from 'bcryptjs'
import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const userSchema = mongoose.Schema(
  {
    phone: { type: String, required: true, unique: true },
    username: reqString,
    email: { type: String, required: true, unique: true },
    password: reqString,
    profilePic: String,
    otp: { type: Number },
    role: {
      type: String,
      enum: ['ADMIN', 'PLAYER', 'INFLUENCER'],
      required: true,
      default: 'PLAYER',
    },
  },
  {
    timestamps: true,
  }
)

userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
  this.dateModified = new Date()
  next()
})

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

const User = mongoose.model('users', userSchema)

export default User
