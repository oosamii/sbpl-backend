import asyncHandler from 'express-async-handler'
import { findById, findByUserId, paginate } from '../manager/finder.js'
import Influencer from '../schemas/influencerSchema.js'
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
      state,
      trialCity,
      trialZone,
      playingRole,
      prefferedBattingOrder,
      battingStyle,
      bowlingStyle,
      referralCode,
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
    let influencerDoc = null
    if (referralCode) {
      influencerDoc = await Influencer.findOne({ referralCode })
      if (influencerDoc) {
        influencerDoc.referrals = influencerDoc.referrals + 1
        await influencerDoc.save()
      }
    }

    const playerDoc = await Player.create({
      user: userDoc._id,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      state,
      trialCity,
      trialZone,
      playingRole,
      prefferedBattingOrder,
      battingStyle,
      bowlingStyle,
      dateOfRegistration: new Date(),
      influencer: influencerDoc ? influencerDoc._id : null,
      status: 'PAYMENT_DONE',
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

export const continuePlayerRegistration = asyncHandler(async (req, res) => {
  try {
    const {
      playerId,
      address,
      state,
      city,
      pincode,
      locality,
      landmark,
      currentAddress,
      currentState,
      currentCity,
      currentPincode,
      currentLocality,
      currentLandmark,
      aadhaarNumber,
      emergencyContact,
      instagramId,
      facebookId,
      playingRole,
      battingStyle,
      bowlingStyle,
      prefferedBattingOrder,
      trouserSize,
      tshirtSize,
      shoeSize,
      bloodGroup,
      aadhaarImage,
      profileImage,
    } = req.body

    let playerDoc = await findById(Player, playerId, ['user'], 'Player', res)
    if (!playerDoc) {
      return handleNotFound(res, 'Player', playerId)
    }

    let userDoc = playerDoc.user
    userDoc.profilePic = profileImage
    await userDoc.save()

    playerDoc.address = address
    playerDoc.state = state
    playerDoc.city = city
    playerDoc.pincode = pincode
    playerDoc.locality = locality
    playerDoc.landmark = landmark
    playerDoc.currentAddress = currentAddress
    playerDoc.currentState = currentState
    playerDoc.currentCity = currentCity
    playerDoc.currentPincode = currentPincode
    playerDoc.currentLocality = currentLocality
    playerDoc.currentLandmark = currentLandmark
    playerDoc.aadhaarNumber = aadhaarNumber
    playerDoc.emergencyContact = emergencyContact
    playerDoc.instagramId = instagramId
    playerDoc.facebookId = facebookId
    playerDoc.playingRole = playingRole
    playerDoc.battingStyle = battingStyle
    playerDoc.bowlingStyle = bowlingStyle
    playerDoc.prefferedBattingOrder = prefferedBattingOrder
    playerDoc.trouserSize = trouserSize
    playerDoc.tshirtSize = tshirtSize
    playerDoc.shoeSize = shoeSize
    playerDoc.bloodGroup = bloodGroup
    playerDoc.aadhaarImage = aadhaarImage
    playerDoc.status = 'DETAILS_FILLED'

    playerDoc = await playerDoc.save()

    return res.status(200).json({
      success: true,
      playerDoc,
      msg: 'Player Updated',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})
