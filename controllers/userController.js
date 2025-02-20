import bcrypt from 'bcryptjs'
import asyncHandler from 'express-async-handler'
import mongoose from 'mongoose'
import { paginate } from '../manager/finder.js'
import User from '../schemas/userSchema.js'
import { sendEmail } from '../utils/emailSender.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
  handleNotFound,
} from '../utils/responseHandlers.js'

export const createAdminUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, phone, password } = req.body

    let userDoc = await User.findOne({ email })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', email)
    }
    userDoc = await User.findOne({ phone })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', phone)
    }

    userDoc = await User.create({
      username,
      email,
      phone,
      password,
      role: 'ADMIN',
    })

    console.log('Admin User created successfully', userDoc)

    return res.status(200).json({
      success: true,
      userDoc,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Admin user')
  }
})

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(401).json({ success: false, msg: 'Invalid email' })
    }

    const isMatch = await user.matchPassword(password)
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: 'Invalid password' })
    }

    const token = user.getSignedJwtToken()

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    })
  } catch (error) {
    return handleErrorResponse(res, error, 'Error during login')
  }
})

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'asc',
    }

    const { documents: users, pagination } = await paginate(User, {}, options)
    return res.status(200).json({
      success: true,
      users,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching users')
  }
})

export const getUserByToken = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params
    if (!userId) return handleNotFound(res, 'User', userId)

    const user = await User.findByIdAndDelete(userId)
    if (!user) return handleNotFound(res, 'User', userId)

    return res.status(200).json({
      success: true,
      msg: 'User deleted successfully',
      user,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

function generateSecureNumericOTP(length) {
  length = 4

  const digits = '0123456789'
  const digitsLength = digits.length

  const array = new Uint32Array(length)

  crypto.getRandomValues(array)

  const otp = Array.from(array, (value) => digits[value % digitsLength]).join(
    ''
  )
  if (otp.length === length) {
    return otp
  }
  return generateSecureNumericOTP(length)
}

export const forgotPassword = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' })
    }

    const otp = generateSecureNumericOTP(4)
    user.otp = otp
    await user.save()

    await sendEmail(
      email,
      'Password Reset OTP',
      `<p>Your OTP for password reset is: <strong>${otp}</strong></p>`
    )

    return res.status(200).json({ success: true, msg: 'OTP sent successfully' })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .json({ success: false, msg: 'Internal Server Error' })
  }
})

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body

    if (!mongoose.connection.readyState) {
      console.error('MongoDB Disconnected')
      return res
        .status(500)
        .json({ success: false, msg: 'Database connection error' })
    }

    console.log('Received email:', email)

    // Fetch user and log details
    const user = await User.findOne({ email: email.toLowerCase() })
    console.log('User found:', user ? user.email : 'No user found')

    if (!user) {
      return res.status(404).json({ success: false, msg: 'User not found' })
    }

    // Log stored OTP and incoming OTP
    console.log('Stored OTP:', user.otp, 'Entered OTP:', otp)

    // Convert both OTPs to the same type for comparison
    if (!user.otp || user.otp.toString() !== otp.toString()) {
      return res.status(400).json({ success: false, msg: 'Invalid OTP' })
    }

    // Hash the new password
    const salt = await bcrypt.genSalt(10)
    user.password = await bcrypt.hash(newPassword, salt)

    // Clear OTP after successful password reset
    user.otp = null

    await user.save()

    return res
      .status(200)
      .json({ success: true, msg: 'Password reset successful' })
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return res
      .status(500)
      .json({ success: false, msg: 'Internal Server Error' })
  }
})
