import asyncHandler from 'express-async-handler'
import { paginate } from '../manager/finder.js'
import User from '../schemas/userSchema.js'
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
