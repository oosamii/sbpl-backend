import asyncHandler from 'express-async-handler'
import { findById, findByUserId, paginate } from '../manager/finder.js'
import Influencer from '../schemas/influencerSchema.js'
import User from '../schemas/userSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
} from '../utils/responseHandlers.js'

export const createInfluencer = asyncHandler(async (req, res) => {
  try {
    const { email, phone, password, username } = req.body

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
      role: 'INFLUENCER',
    })

    console.log('Influencer User created successfully', userDoc)

    // Fix: Corrected reference to `influencer`
    const influencerDoc = await influencer.create({
      user: userDoc._id,
      referrals: 0,
    })

    return res.status(200).json({
      success: true,
      influencerDoc,
      msg: 'Influencer Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(
      res,
      error,
      'Error while creating Influencer user'
    )
  }
})

// export const getInfluencerById = asyncHandler(async (req, res) => {
//   try {
//     const { influencerId } = req.params
//     const influencer = await findById(
//       Influencer,
//       influencerId,
//       ['user'],
//       'Influencer',
//       res
//     )

//     if (!influencer) {
//       return handleNotFound(res, 'Influencer', influencerId)
//     }

//     return res.status(200).json({
//       success: true,
//       influencer,
//     })
//   } catch (error) {
//     console.log(error)
//     return handleErrorResponse(res, error)
//   }
// })

export const getAllInfluencers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'asc',
      populateFields: ['user'],
    }

    // Ensure influencers is defined before use
    const { documents: influencers, pagination } = await paginate(
      Influencer,
      {},
      options
    )

    return res.status(200).json({
      success: true,
      influencers,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Influencers')
  }
})

export const getInfluencerByUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params

    // Find influencer based on userId
    const influencer = await findByUserId(Influencer, userId, 'Influencer', res)
    if (!influencer) {
      return handleNotFound(res, 'Influencer', userId)
    }

    return res.status(200).json({
      success: true,
      influencer,
    })
  } catch (error) {
    console.error(error)
    handleErrorResponse(res, error)
  }
})
