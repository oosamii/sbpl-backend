import asyncHandler from 'express-async-handler'
import { parse } from 'json2csv'
import { findById, findByUserId, paginate } from '../manager/finder.js'
import Influencer from '../schemas/influencerSchema.js'
import Player from '../schemas/playerSchema.js'
import User from '../schemas/userSchema.js'
import { sendEmail } from '../utils/emailSender.js'
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
      pincode,
      state,
      trialCity,
      trialZone,
      playingRole,
      prefferedBattingOrder,
      battingHandedness,
      battingStyle,
      bowlingStyle,
      bowlingHandedness,
      referralCode,
      paymentId,
      aadhaarNumber,
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
      pincode,
      state,
      trialCity,
      trialZone,
      playingRole,
      prefferedBattingOrder,
      battingStyle,
      bowlingStyle,
      battingHandedness,
      bowlingHandedness,
      dateOfRegistration: new Date(),
      influencer: influencerDoc ? influencerDoc._id : null,
      status: 'PAYMENT_DONE',
      referralCode,
      paymentId: paymentId?.current ?? '',
      aadhaarNumber,
    })

    //send email to player Payment recieved, Registration successfull.
    try {
      sendEmail(
        userDoc?.email,
        'Payment Recieved',
        `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Player Registration</title>
              </head>
              <body>
                <div
                  style="
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    font-family: Arial, sans-serif;
                    color: #333;
                  "
                >
                  <div
                    style="
                      text-align: center;
                      padding: 20px;
                      background-color: #ffcc00;
                      border-radius: 10px 10px 0 0;
                    "
                  >
                    <h1 style="color: #333; margin: 0">Congratulations!</h1>
                  </div>
                  <div
                    style="
                      padding: 20px;
                      background: rgba(255, 255, 255, 0.8);
                      backdrop-filter: blur(5px);
                      border-radius: 0 0 10px 10px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 15px">Dear Player,</p>
                    <p style="margin: 0 0 15px">You have successfully registered!</p>

                    <div
                      style="
                        margin: 20px 0;
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        padding: 15px;
                        border-radius: 10px;
                        background: #333;
                        color: #ffcc00;
                        display: inline-block;
                        letter-spacing: 3px;
                      "
                    >
                      SBPL${playerDoc?._id
                        ?.toString()
                        ?.slice(-6)
                        ?.toUpperCase()}
                    </div>

                    <p style="margin: 0 0 15px; font-weight: bold;">Stay Tuned! Trials coming soon.</p>
                    <p style="margin: 0 0 15px;">
                      Share your golden ticket on social media for more visibility of your profile.
                    </p>
                    <p style="margin: 0 0 15px;">
                      Before getting a chance to become a pro, let the world know! :')
                    </p>
                  </div>
                  <div
                    style="
                      text-align: center;
                      margin-top: 10px;
                      padding: 15px;
                      background-color: #f0f0f0;
                      border-radius: 10px;
                    "
                  >
                    <p style="margin: 0">Thank you for being part of SBPL!</p>
                    <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
                      &copy; 2025
                      <a style="text-decoration: none" href="https://sbpl-tc.com/"
                        >South Bharath Premier League</a
                      >
                      powered by
                      <a
                        style="text-decoration: none"
                        href="https://www.orbittechnologys.com/"
                        >Orbit Technologys</a
                      >
                      . All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>`
      )
    } catch (error) {
      console.log('Error while sending email for user', userDoc)
    }

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

export const createGulfPlayer = asyncHandler(async (req, res) => {
  try {
    const {
      email,
      phone,
      password,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      aadhaarNumber,
      selectCountry,
      selectState,
      playingRole,
      battingHandedness,
      bowlingHandedness,
      referralCode,
      paymentId,
    } = req.body

    // Check if the user already exists
    let userDoc = await User.findOne({ email })
    if (userDoc) return handleAlreadyExists(res, 'User', email)

    userDoc = await User.findOne({ phone })
    if (userDoc) return handleAlreadyExists(res, 'User', phone)

    // Create new user
    userDoc = await User.create({
      username: `${firstName} ${middleName ?? ''} ${lastName}`,
      email,
      phone,
      password,
      role: 'PLAYER',
    })

    console.log('Gulf Player User created successfully', userDoc)

    let influencerDoc = null
    if (referralCode) {
      influencerDoc = await Influencer.findOne({ referralCode })
      if (influencerDoc) {
        influencerDoc.referrals += 1
        await influencerDoc.save()
      }
    }

    // Create new player entry
    const playerDoc = await Player.create({
      user: userDoc._id,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      state: currentState,
      aadhaarNumber,
      selectCountry,
      selectState,
      playingRole,
      battingHandedness,
      bowlingHandedness,
      dateOfRegistration: new Date(),
      influencer: influencerDoc ? influencerDoc._id : null,
      status: 'PAYMENT_DONE',
      referralCode,
      gulfPlayer: true,
      paymentId: paymentId?.current ?? '',
    })

    // Send confirmation email
    try {
      sendEmail(
        userDoc?.email,
        'Payment Recieved',
        `<!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Player Registration</title>
              </head>
              <body>
                <div
                  style="
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    font-family: Arial, sans-serif;
                    color: #333;
                  "
                >
                  <div
                    style="
                      text-align: center;
                      padding: 20px;
                      background-color: #ffcc00;
                      border-radius: 10px 10px 0 0;
                    "
                  >
                    <h1 style="color: #333; margin: 0">Congratulations!</h1>
                  </div>
                  <div
                    style="
                      padding: 20px;
                      background: rgba(255, 255, 255, 0.8);
                      backdrop-filter: blur(5px);
                      border-radius: 0 0 10px 10px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 15px">Dear Player,</p>
                    <p style="margin: 0 0 15px">You have successfully registered!</p>

                    <div
                      style="
                        margin: 20px 0;
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        padding: 15px;
                        border-radius: 10px;
                        background: #333;
                        color: #ffcc00;
                        display: inline-block;
                        letter-spacing: 3px;
                      "
                    >
                      SBPL${playerDoc?._id
                        ?.toString()
                        ?.slice(-6)
                        ?.toUpperCase()}
                    </div>

                    <p style="margin: 0 0 15px; font-weight: bold;">Stay Tuned! Trials coming soon.</p>
                    <p style="margin: 0 0 15px;">
                      Share your golden ticket on social media for more visibility of your profile.
                    </p>
                    <p style="margin: 0 0 15px;">
                      Before getting a chance to become a pro, let the world know! :')
                    </p>
                  </div>
                  <div
                    style="
                      text-align: center;
                      margin-top: 10px;
                      padding: 15px;
                      background-color: #f0f0f0;
                      border-radius: 10px;
                    "
                  >
                    <p style="margin: 0">Thank you for being part of SBPL!</p>
                    <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
                      &copy; 2025
                      <a style="text-decoration: none" href="https://sbpl-tc.com/"
                        >South Bharath Premier League</a
                      >
                      powered by
                      <a
                        style="text-decoration: none"
                        href="https://www.orbittechnologys.com/"
                        >Orbit Technologys</a
                      >
                      . All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>`
      )
    } catch (error) {
      console.log('Error while sending email for user', userDoc)
    }

    return res.status(200).json({
      success: true,
      msg: 'Gulf Player Created Successfully',
      playerDoc,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Gulf Player')
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
      sortOrder: req.query.sortOrder || 'desc',
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
      prefferedBattingOrder,
      battingHandedness,
      battingStyle,
      bowlingStyle,
      bowlingHandedness,
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
    playerDoc.battingHandedness = battingHandedness
    playerDoc.bowlingHandedness = bowlingHandedness
    playerDoc.trouserSize = trouserSize
    playerDoc.tshirtSize = tshirtSize
    playerDoc.shoeSize = shoeSize
    playerDoc.bloodGroup = bloodGroup
    playerDoc.aadhaarImage = aadhaarImage
    playerDoc.status = 'DETAILS_FILLED'

    playerDoc = await playerDoc.save()

    //send email to player, Registration successfull. SBPL<last 6 digits of player ID>
    await sendEmail(
      userDoc?.email,
      'Payment Recieved',
      `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Player Registration</title>
              </head>
              <body>
                <div
                  style="
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    font-family: Arial, sans-serif;
                    color: #333;
                  "
                >
                  <div
                    style="
                      text-align: center;
                      padding: 20px;
                      background-color: #ffcc00;
                      border-radius: 10px 10px 0 0;
                    "
                  >
                    <h1 style="color: #333; margin: 0">Congratulations!</h1>
                  </div>
                  <div
                    style="
                      padding: 20px;
                      background: rgba(255, 255, 255, 0.8);
                      backdrop-filter: blur(5px);
                      border-radius: 0 0 10px 10px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 15px">Dear Player,</p>
                    <p style="margin: 0 0 15px">You have successfully registered!</p>

                    <div
                      style="
                        margin: 20px 0;
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        padding: 15px;
                        border-radius: 10px;
                        background: #333;
                        color: #ffcc00;
                        display: inline-block;
                        letter-spacing: 3px;
                      "
                    >
                      SBPL${playerDoc?._id
                        ?.toString()
                        ?.slice(-6)
                        ?.toUpperCase()}
                    </div>

                    <p style="margin: 0 0 15px; font-weight: bold;">Stay Tuned! Trials coming soon.</p>
                    <p style="margin: 0 0 15px;">
                      Share your golden ticket on social media for more visibility of your profile.
                    </p>
                    <p style="margin: 0 0 15px;">
                      Before getting a chance to become a pro, let the world know! :')
                    </p>
                  </div>
                  <div
                    style="
                      text-align: center;
                      margin-top: 10px;
                      padding: 15px;
                      background-color: #f0f0f0;
                      border-radius: 10px;
                    "
                  >
                    <p style="margin: 0">Thank you for being part of SBPL!</p>
                    <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
                      &copy; 2025
                      <a style="text-decoration: none" href="https://sbpl-tc.com/"
                        >South Bharath Premier League</a
                      >
                      powered by
                      <a
                        style="text-decoration: none"
                        href="https://www.orbittechnologys.com/"
                        >Orbit Technologys</a
                      >
                      . All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            `
    )

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

export const getPlayersByState = async (req, res) => {
  try {
    const { state } = req.params
    console.log('State param received:', state)

    if (!state) {
      return res.status(400).json({ message: 'State parameter is required' })
    }

    const sort = {}
    sort['createdAt'] = -1

    const filteredPlayers = []

    if (state === 'Gulf') {
      const filteredPlayers = await Player.find({
        gulfPlayer: true,
      })
        .sort(sort)
        .exec()
      console.log('Filtered Players:', filteredPlayers)
    } else {
      filteredPlayers = await Player.find({
        state: new RegExp(`^${state}$`, 'i'),
      })
        .sort(sort)
        .exec()
      console.log('Filtered Players:', filteredPlayers)
    }

    if (!filteredPlayers.length) {
      return res
        .status(404)
        .json({ message: 'No players found for this state' })
    }

    res.status(200).json(filteredPlayers)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: 'Server error' })
  }
}

export const searchPlayers = asyncHandler(async (req, res) => {
  try {
    const { query } = req.query

    if (!query) {
      return res.status(400).json({
        success: false,
        msg: 'Query parameter is required',
      })
    }

    const searchQuery = new RegExp(query, 'i')
    const players = await Player.find({
      $or: [
        { firstName: { $regex: searchQuery } },
        { lastName: { $regex: searchQuery } },
        { middleName: { $regex: searchQuery } },
        { state: { $regex: searchQuery } },
        { city: { $regex: searchQuery } },
        { playingRole: { $regex: searchQuery } },
        { battingStyle: { $regex: searchQuery } },
        { bowlingStyle: { $regex: searchQuery } },
      ],
    })

    if (players.length === 0) {
      return res.status(404).json({
        success: false,
        msg: 'No players found with the given query',
      })
    }

    return res.status(200).json({
      success: true,
      msg: 'Players retrieved successfully',
      data: players,
    })
  } catch (error) {
    console.error(error)
    return res.status(500).json({
      success: false,
      msg: 'Failed to retrieve players',
      error: error.message,
    })
  }
})

export const getPlayersReportCSV = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find({})
      .populate('user')
      .populate('influencer')

    if (players.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'No players found.',
      })
    }

    const csvData = players.map((player) => ({
      playerId: player._id,
      firstName: player.firstName,
      middleName: player.middleName || 'N/A',
      lastName: player.lastName,
      dateOfBirth: player.dateOfBirth,
      trialCity: player.trialCity,
      trialZone: player.trialZone,
      address: player.address || 'N/A',
      state: player.state,
      city: player.city,
      locality: player.locality,
      pincode: player.pincode || 'N/A',
      landmark: player.landmark || 'N/A',
      currentAddress: player.currentAddress || 'N/A',
      currentState: player.currentState,
      currentCity: player.currentCity,
      currentLocality: player.currentLocality,
      currentPincode: player.currentPincode,
      currentLandmark: player.currentLandmark,
      aadhaarNumber: player.aadhaarNumber || 'N/A',
      emergencyContact: player.emergencyContact || 'N/A',
      instagramId: player.instagramId || 'N/A',
      facebookId: player.facebookId || 'N/A',
      aadhaarImage: player.aadhaarImage || 'N/A',
      trouserSize: player.trouserSize || 'N/A',
      tshirtSize: player.tshirtSize || 'N/A',
      shoeSize: player.shoeSize || 'N/A',
      bloodGroup: player.bloodGroup || 'N/A',
      playingRole: player.playingRole,
      prefferedBattingOrder: player.prefferedBattingOrder,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle || 'N/A',
      dateOfRegistration: player.dateOfRegistration,
      status: player.status,
      influencer: player.influencer ? player.influencer.name : 'N/A', // If influencer exists
      createdAt: player.createdAt,
      updatedAt: player.updatedAt,
    }))

    const csv = parse(csvData, {
      fields: [
        'playerId',
        'firstName',
        'middleName',
        'lastName',
        'dateOfBirth',
        'trialCity',
        'trialZone',
        'address',
        'state',
        'city',
        'locality',
        'pincode',
        'landmark',
        'currentAddress',
        'currentState',
        'currentCity',
        'currentLocality',
        'currentPincode',
        'currentLandmark',
        'aadhaarNumber',
        'emergencyContact',
        'instagramId',
        'facebookId',
        'aadhaarImage',
        'trouserSize',
        'tshirtSize',
        'shoeSize',
        'bloodGroup',
        'playingRole',
        'prefferedBattingOrder',
        'battingStyle',
        'bowlingStyle',
        'dateOfRegistration',
        'status',
        'influencer',
        'createdAt',
        'updatedAt',
      ],
    })

    res.header('Content-Type', 'text/csv')
    res.attachment('playersReport.csv')

    return res.send(csv)
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, error })
  }
})

export const recentRegisteration = asyncHandler(async (req, res) => {
  try {
    const { limit = 10 } = req.query

    const recentPlayers = await Player.find()
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
    return res.status(200).json({
      success: true,
      data: recentPlayers,
    })
  } catch (error) {
    console.error('Error fetching recent registrations:', error)
    return res.status(500).json({
      success: false,
      message: 'Error while fetching recent registrations',
    })
  }
})

export const fetchPlayersByStatus = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query

    const players = await Player.find({ status }).populate('user').exec()
    const count = await Player.countDocuments({ status })

    return res.status(200).json({
      success: true,
      players,
      count,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const fetchPlayersByStatusCSV = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query

    const players = await Player.find({ status }).populate('user').exec()
    const count = await Player.countDocuments({ status })
    console.log(`Generating CSV for ${count} Players`)
    const csvData = players.map((player) => ({
      playerId: player._id,
      firstName: player.firstName,
      lastName: player.lastName,
      phone: player.user.phone,
      email: player.user.email,
      dateOfBirth: player.dateOfBirth,
      trialCity: player.trialCity,
      trialZone: player.trialZone,
      state: player.state,
      pincode: player.pincode || 'N/A',
      playingRole: player.playingRole,
      dateOfRegistration: player.dateOfRegistration,
      status: player.status,
    }))

    const csv = parse(csvData, {
      fields: [
        'playerId',
        'firstName',
        'lastName',
        'email',
        'phone',
        'dateOfBirth',
        'trialCity',
        'trialZone',
        'state',
        'pincode',
        'playingRole',
        'dateOfRegistration',
        'status',
      ],
    })

    res.header('Content-Type', 'text/csv')
    res.attachment('playersReport.csv')

    return res.send(csv)
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const sendEmailToPlayers = asyncHandler(async (req, res) => {
  try {
    const { status } = req.query

    const players = await Player.find({ status }).populate('user').exec()
    const count = await Player.countDocuments({ status })

    if (!players.length) {
      return res.status(404).json({ success: false, msg: 'No players found' })
    }

    players.forEach((player) => {
      if (player?.user?.email) {
        const emailContent = `
          <html>
            <body style="font-family: Arial, sans-serif;">
              <h2>Dear ${player.firstName},</h2>
              <p>Your profile is incomplete. Please log in to complete your profile and receive your ticket.</p>
              <p>
                <a href="https://sbpl-tc.com/login" style="display: inline-block; padding: 10px 15px; background-color: #007bff; color: #fff; text-decoration: none; border-radius: 5px;">Complete Your Profile</a>
              </p>
              <p>Thank you!</p>
              <p><strong>South Bharath Premier League</strong></p>
            </body>
          </html>
        `
        try {
          sendEmail(player.user.email, 'Profile Incomplete', emailContent)
        } catch (error) {
          console.log('Error while sending mail for ' + player.user.email)
        }
      }
    })

    return res.status(200).json({
      success: true,
      msg: 'Players received mail',
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, msg: 'Server Error' })
  }
})

export const usersWithoutPlayer = asyncHandler(async (req, res) => {
  try {
    const players = await Player.find({}, 'user') // Get all player user IDs
    const playerUserIds = players.map((player) => player.user.toString())

    const usersWithoutPlayers = await User.find({
      role: 'PLAYER',
      _id: { $nin: playerUserIds }, // Users not in the Player collection
    })

    const count = await User.countDocuments({
      role: 'PLAYER',
      _id: { $nin: playerUserIds },
    })

    const csvData = usersWithoutPlayers.map((user) => ({
      userId: user._id,
      username: user.username,
      email: user.email,
      phone: user.phone,
      createdAt: user.createdAt,
    }))

    const csv = parse(csvData, {
      fields: ['userId', 'username', 'email', 'phone', 'createdAt'],
    })

    res.header('Content-Type', 'text/csv')
    res.attachment('playersReport.csv')

    return res.send(csv)
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const partialPlayerRegistration = asyncHandler(async (req, res) => {
  try {
    const {
      userId,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      playingRole,
      battingHandedness,
      bowlingHandedness,
      pincode,
      state,
      trialCity,
      trialZone,
    } = req.body

    const user = await findById(User, userId, [], 'User', res)
    if (!user) {
      return handleNotFound(res, 'User', userId)
    }

    const player = await Player.create({
      user: userId,
      firstName,
      middleName,
      lastName,
      dateOfBirth,
      playingRole,
      battingHandedness,
      bowlingHandedness,
      pincode,
      state,
      trialCity,
      trialZone,
      dateOfRegistration: new Date(),
      status: 'PAYMENT_DONE',
    })

    await sendEmail(
      user?.email,
      'Registration Successfull',
      `
            <!DOCTYPE html>
            <html lang="en">
              <head>
                <meta charset="UTF-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <title>Player Registration</title>
              </head>
              <body>
                <div
                  style="
                    max-width: 600px;
                    margin: 0 auto;
                    padding: 20px;
                    background-color: #f9f9f9;
                    border-radius: 10px;
                    font-family: Arial, sans-serif;
                    color: #333;
                  "
                >
                  <div
                    style="
                      text-align: center;
                      padding: 20px;
                      background-color: #ffcc00;
                      border-radius: 10px 10px 0 0;
                    "
                  >
                    <h1 style="color: #333; margin: 0">Congratulations!</h1>
                  </div>
                  <div
                    style="
                      padding: 20px;
                      background: rgba(255, 255, 255, 0.8);
                      backdrop-filter: blur(5px);
                      border-radius: 0 0 10px 10px;
                      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
                      text-align: center;
                    "
                  >
                    <p style="margin: 0 0 15px">Dear Player,</p>
                    <p style="margin: 0 0 15px">You have successfully registered!</p>

                    <div
                      style="
                        margin: 20px 0;
                        font-size: 24px;
                        font-weight: bold;
                        text-align: center;
                        padding: 15px;
                        border-radius: 10px;
                        background: #333;
                        color: #ffcc00;
                        display: inline-block;
                        letter-spacing: 3px;
                      "
                    >
                      SBPL${player?._id?.toString()?.slice(-6)?.toUpperCase()}
                    </div>

                    <p style="margin: 0 0 15px; font-weight: bold;">Stay Tuned! Trials coming soon.</p>
                    <p style="margin: 0 0 15px;">
                      Share your golden ticket on social media for more visibility of your profile.
                    </p>
                    <p style="margin: 0 0 15px;">
                      Before getting a chance to become a pro, let the world know! :')
                    </p>
                  </div>
                  <div
                    style="
                      text-align: center;
                      margin-top: 10px;
                      padding: 15px;
                      background-color: #f0f0f0;
                      border-radius: 10px;
                    "
                  >
                    <p style="margin: 0">Thank you for being part of SBPL!</p>
                    <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
                      &copy; 2025
                      <a style="text-decoration: none" href="https://sbpl-tc.com/"
                        >South Bharath Premier League</a
                      >
                      powered by
                      <a
                        style="text-decoration: none"
                        href="https://www.orbittechnologys.com/"
                        >Orbit Technologys</a
                      >
                      . All rights reserved.
                    </p>
                  </div>
                </div>
              </body>
            </html>
            `
    )

    return res.status(200).json({
      success: true,
      player,
      msg: 'Player created successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error)
  }
})

export const getAllGulfPlayers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
      populateFields: ['user'],
    }

    const { documents: players, pagination } = await paginate(
      Player,
      { gulfPlayer: true },
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
