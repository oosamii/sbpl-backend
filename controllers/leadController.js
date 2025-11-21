import asyncHandler from 'express-async-handler'
import { Parser } from 'json2csv'
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

export const downloadLeadsCSV = asyncHandler(async (req, res) => {
  try {
    const leads = await Lead.find().lean();

    if (!leads || leads.length === 0) {
      return res.status(404).json({
        success: false,
        msg: "No leads found",
      });
    }

    // 🟦 Remove _id, __v, password and add SI No
    const cleanedLeads = leads.map((lead, index) => {
      const { _id, __v, password, ...rest } = lead;
      return {
        SI_No: index + 1,
        ...rest,
      };
    });

    // 🟩 Capitalize headers
    const fields = Object.keys(cleanedLeads[0]).map((field) => {
      return {
        label: field
          .replace(/_/g, " ")        // Replace _ with space
          .replace(/\b\w/g, (c) => c.toUpperCase()), // Capitalize each word
        value: field,
      };
    });

    const json2csvParser = new Parser({ fields });
    const csvData = json2csvParser.parse(cleanedLeads);

    res.setHeader("Content-Type", "text/csv");
    res.setHeader("Content-Disposition", "attachment; filename=leads.csv");

    return res.status(200).end(csvData);
  } catch (error) {
    console.log("Error generating CSV:", error);
    return res.status(500).json({
      success: false,
      msg: "Error while generating CSV",
      error: error.message,
    });
  }
});

