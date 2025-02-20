import asyncHandler from 'express-async-handler'
import { findById, findByUserId, paginate } from '../manager/finder.js'
import Influencer from '../schemas/influencerSchema.js'
import User from '../schemas/userSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
} from '../utils/responseHandlers.js'
import { parse } from 'json2csv'

export const createInfluencer = asyncHandler(async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      username,
      instagramId,
      referralCode,
      city,
      state,
    } = req.body

    let userDoc = await User.findOne({ email })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', email)
    }

    userDoc = await User.findOne({ phone })
    if (userDoc) {
      return handleAlreadyExists(res, 'User', phone)
    }

    let influencerDoc = await Influencer.findOne({ referralCode })
    if (influencerDoc) {
      return handleAlreadyExists(res, 'Influencer', referralCode)
    }

    userDoc = await User.create({
      username,
      email,
      phone,
      password,
      role: 'INFLUENCER',
    })

    console.log('Influencer User created successfully', userDoc)

    influencerDoc = await Influencer.create({
      user: userDoc._id,
      referrals: 0,
      instagramId,
      referralCode,
      city,
      state,
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

export const getInfluencerById = asyncHandler(async (req, res) => {
  try {
    const { influencerId } = req.params
    const influencer = await findById(
      Influencer,
      influencerId,
      ['user'],
      'Influencer',
      res
    )

    if (!influencer) {
      return handleNotFound(res, 'Influencer', influencerId)
    }

    return res.status(200).json({
      success: true,
      influencer,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const getAllInfluencers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'asc',
      populateFields: ['user'],
    }
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

export const getTotalCountOfInfluencer = asyncHandler(async (req, res) => {
  try {
    const totalCount = await Influencer.countDocuments()
    res.status(200).json({ totalCount })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

// Get total referrals from all influencers
export const getTotalReferrals = asyncHandler(async (req, res) => {
  try {
    const totalReferrals = await Influencer.aggregate([
      {
        $group: {
          _id: null,
          totalReferrals: { $sum: '$referrals' },
        },
      },
    ])

    res
      .status(200)
      .json({ totalReferrals: totalReferrals[0]?.totalReferrals || 0 })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

// Get top K influencers sorted by referrals
export const getTopKInfluencer = asyncHandler(async (req, res) => {
  try {
    const { k } = req.query
    const topInfluencers = await Influencer.find()
      .sort({ referrals: -1 })
      .limit(Number(k))
      .populate('user')  

    res.status(200).json({ topInfluencers })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const searchInfluencers = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query

    if (!query) {
      return res.status(400).json({ message: 'Query parameter is required' })
    }

    const searchRegex = new RegExp(query, 'i') // Case-insensitive search

    const influencers = await Influencer.find({
      $or: [
        { referralCode: searchRegex },
        { instagramId: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
      ],
    })
      .skip((page - 1) * limit)
      .limit(parseInt(limit))

    if (influencers.length === 0) {
      return res.status(404).json({ message: 'No influencers found' })
    }

    res.json({ count: influencers.length, influencers })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
}

export const getInfluencersReportCSV = asyncHandler(async (req, res) => {
  try {
    const influencers = await Influencer.find({}).populate("user");

    if (influencers.length === 0) {
      return res.status(404).json({
        success: false,
        message: "No influencers found.",
      });
    }

    const csvData = influencers.map((influencer) => ({
      influencerId: influencer._id,
      userId: influencer.user ? influencer.user._id : "N/A", 
      referrals: influencer.referrals,
      referralCode: influencer.referralCode,
      instagramId: influencer.instagramId || "N/A",
      city: influencer.city || "N/A",
      state: influencer.state || "N/A",
      dateOfRegistration: influencer.createdAt, 
      updatedAt: influencer.updatedAt,
    }));

    const csv = parse(csvData, {
      fields: [
        "influencerId",
        "userId",
        "referrals",
        "referralCode",
        "instagramId",
        "city",
        "state",
        "dateOfRegistration",
        "updatedAt",
      ],
    });

    res.header('Content-Type', 'text/csv');
    res.attachment('influencersReport.csv');

    return res.send(csv);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ success: false, error });
  }
});
