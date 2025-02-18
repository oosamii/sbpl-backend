import asyncHandler from 'express-async-handler'
import User from '../schemas/userSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
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
