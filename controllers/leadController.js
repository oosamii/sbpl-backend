import asyncHandler from 'express-async-handler'
import { paginate } from '../manager/finder.js'
import Lead from '../schemas/leadSchema.js'
import {
  handleErrorResponse,
  handleNotFound,
} from '../utils/responseHandlers.js'

export const createLead = asyncHandler(async (req, res) => {
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
      battingHandedness,
      bowlingHandedness,
      referralCode,
      paymentId,
      orderId,
      aadhaarNumber,
      selectCountry,
    } = req.body

    const lead = await Lead.create({
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
      battingHandedness,
      bowlingHandedness,
      referralCode,
      paymentId,
      orderId,
      aadhaarNumber,
      selectCountry,
    })

    return res.status(200).json({
      success: true,
      lead,
      msg: 'Lead Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Lead')
  }
})

export const getLeadById = asyncHandler(async (req, res) => {
  try {
    const { leadId } = req.params

    const lead = await Lead.findById(leadId)
    if (!lead) {
      return handleNotFound(res, 'Lead', leadId)
    }

    return res.status(200).json({
      lead,
      success: true,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Lead')
  }
})

export const getAllLeads = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    }

    const { documents: leads, pagination } = await paginate(Lead, {}, options)

    return res.status(200).json({
      success: true,
      leads,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching all leads')
  }
})

import fastCsv from 'fast-csv'
import { createWriteStream } from 'fs'
import { join } from 'path'
import os from 'os'

export const downloadCsv = asyncHandler(async (req, res) => {
  try {
    const leads = await Lead.find().lean()

    if (!leads.length) {
      return res.status(404).json({ success: false, message: 'No leads found' })
    }

    const tempFilePath = join(os.tmpdir(), 'leads.csv')
    const writableStream = createWriteStream(tempFilePath)

    const csvStream = fastCsv.format({ headers: true })
    csvStream.pipe(writableStream)

    leads.forEach((lead) => csvStream.write(lead))
    csvStream.end()

    writableStream.on('finish', () => {
      res.download(tempFilePath, 'leads.csv', (err) => {
        if (err) console.log(err)
      })
    })
  } catch (error) {
    console.log(error)
    return res.status(500).json({ success: false, message: 'Error while generating CSV' })
  }
})
