import asyncHandler from 'express-async-handler';
import { paginate } from '../manager/finder.js';
import Header from '../schemas/headerSchema.js';
import {
  handleErrorResponse
} from '../utils/responseHandlers.js';

/* export const createHeader = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body

    // Check duplicate by title
    let headerDoc = await Header.findOne({ title })
    if (headerDoc) {
      return handleAlreadyExists(res, 'Header', title)
    }

    headerDoc = await Header.create({
      title,
      description,
    })

    return res.status(200).json({
      success: true,
      header: headerDoc,
      msg: 'Header Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Header')
  }
}) */

export const createHeader = asyncHandler(async (req, res) => {
  try {
    const { title, description } = req.body;

    // Find any existing header
    let headerDoc = await Header.findOne();

    if (headerDoc) {
      // Update existing header
      headerDoc.title = title;
      headerDoc.description = description;
      await headerDoc.save();
    } else {
      // Create new header
      headerDoc = await Header.create({ title, description });
    }

    return res.status(200).json({
      success: true,
      header: headerDoc,
      msg: "Header Saved Successfully",
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error, "Error while saving Header");
  }
});

export const getAllHeaders = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    }

    const { documents: headers, pagination } = await paginate(
      Header,
      {},
      options
    )

    return res.status(200).json({
      success: true,
      headers,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Headers')
  }
})

export const updateHeader = asyncHandler(async (req, res) => {
  try {
    const { headerId, title, description } = req.body

    let headerDoc = await Header.findById(headerId)
    if (!headerDoc) {
      return res.status(404).json({ success: false, msg: 'Header not found' })
    }

    headerDoc.title = title || headerDoc.title
    headerDoc.description = description || headerDoc.description

    await headerDoc.save()

    return res.status(200).json({
      success: true,
      header: headerDoc,
      msg: 'Header updated successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while updating Header')
  }
})

export const deleteHeader = asyncHandler(async (req, res) => {
  try {
    const { headerId } = req.params

    const headerDoc = await Header.findById(headerId)
    if (!headerDoc) {
      return res.status(404).json({ success: false, msg: 'Header not found' })
    }

    await Header.findByIdAndDelete(headerId)

    return res.status(200).json({
      success: true,
      msg: 'Header deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while deleting Header')
  }
})

export const getHeaderById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const header = await Header.findById(id)
    if (!header) {
      return res.status(404).json({ success: false, msg: 'No Header Found' })
    }

    return res.status(200).json({
      success: true,
      header,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while getting Header')
  }
})

export const getAllNoPage = asyncHandler(async (req, res) => {
  try {
    const headers = await Header.find()
    if (!headers) {
      return res.status(404).json({ success: false, msg: 'No Headers Found' });
    }

    return res.status(200).json({
      success: true,
      headers,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Headers')
  }
})
