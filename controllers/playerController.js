import asyncHandler from 'express-async-handler'
import { findById, findByUserId, paginate } from '../manager/finder.js'
import Player from '../schemas/playerSchema.js'
import User from '../schemas/userSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
  handleNotFound,
} from '../utils/responseHandlers.js'

export const createPlayer = asyncHandler(async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      address,
      state,
      city,
      locality,
      pincode,
      landmark,
      currentAddress,
      currentState,
      currentCity,
      currentLocality,
      currentPincode,
      currentLandmark,
      aadhaarNumber,
      emergencyContact,
      instagramId,
      facebookId,
      aadhaarImage,
      trouserSize,
      tshirtSize,
      shoeSize,
      bloodGroup,
      playingRole,
      prefferedBattingOrder,
      battingStyle,
      bowlingStyle,
    } = req.body

    let userDoc = await User.findOne({ email })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', email)
    }
    userDoc = await User.findOne({ phone })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', phone)
    }

    userDoc = await User.create({
      username: `${firstName} ${middleName ?? ''} ${lastName}`,
      email,
      phone,
      password,
      role: 'PLAYER',
    })

    console.log('Player User created successfully', userDoc)

    const playerDoc = await Player.create({
      user: userDoc._id,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      address,
      state,
      city,
      locality,
      pincode,
      landmark,
      currentAddress,
      currentState,
      currentCity,
      currentLocality,
      currentPincode,
      currentLandmark,
      aadhaarNumber,
      emergencyContact,
      instagramId,
      facebookId,
      aadhaarImage,
      trouserSize,
      tshirtSize,
      shoeSize,
      bloodGroup,
      playingRole,
      prefferedBattingOrder,
      battingStyle,
      bowlingStyle,
      dateOfRegistration: new Date(),
    })

    return res.status(200).json({
      success: true,
      playerDoc,
      msg: 'Player Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Admin user')
  }
})

export const getPlayerById = asyncHandler(async (req, res) => {
  try {
    const { playerId } = req.params
    const player = await findById(Player, playerId, ['user'], 'Player', res)
    if (!player) {
      return handleNotFound(res, 'Player', playerId)
    }

    return res.status(200).json({
      success: true,
      player,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const getPlayerByUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params

    const player = await findByUserId(Player, userId, 'Player', res)
    if (!player) {
      return handleNotFound(res, 'Player', userId)
    }

    return res.status(200).json({
      success: true,
      player,
    })
  } catch (error) {
    console.log(error)
    handleErrorResponse(res, error)
  }
})

export const getAllPlayers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'asc',
      populateFields: ['user'],
    }

    const { documents: players, pagination } = await paginate(
      Player,
      {},
      options
    )
    return res.status(200).json({
      success: true,
      players,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Players')
  }
})

export const getPlayerRegistrationsCount = asyncHandler(async (req, res) => {
  try {
    const totalRegistrations = await Player.countDocuments()

    return res.status(200).json({
      success: true,
      totalRegistrations,
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({
      success: false,
      message: 'Error fetching player registrations count',
      error: error.message,
    })
  }
})
