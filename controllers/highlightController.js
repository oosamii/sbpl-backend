import asyncHandler from 'express-async-handler'
import { paginate } from '../manager/finder.js'
import Highlight from '../schemas/highlightSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
} from '../utils/responseHandlers.js'

export const createHighlight = asyncHandler(async (req, res) => {
  try {
    const { title, description, mediaUrl } = req.body

    // Check duplicate by title
    let highlightDoc = await Highlight.findOne({ title })
    if (highlightDoc) {
      return handleAlreadyExists(res, 'Highlight', title)
    }

    highlightDoc = await Highlight.create({
      title,
      description,
      mediaUrl,
    })

    return res.status(200).json({
      success: true,
      highlight: highlightDoc,
      msg: 'Highlight Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Highlight')
  }
})

export const getAllHighlights = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    }

    const { documents: highlights, pagination } = await paginate(
      Highlight,
      {},
      options
    )

    return res.status(200).json({
      success: true,
      highlights,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Highlights')
  }
})

export const updateHighlight = asyncHandler(async (req, res) => {
  try {
    const { highlightId, title, description, mediaUrl } = req.body

    let highlightDoc = await Highlight.findById(highlightId)
    if (!highlightDoc) {
      return res.status(404).json({ success: false, msg: 'Highlight not found' })
    }

    highlightDoc.title = title || highlightDoc.title
    highlightDoc.description = description || highlightDoc.description
    highlightDoc.mediaUrl = mediaUrl || highlightDoc.mediaUrl

    await highlightDoc.save()

    return res.status(200).json({
      success: true,
      highlight: highlightDoc,
      msg: 'Highlight updated successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while updating Highlight')
  }
})

export const deleteHighlight = asyncHandler(async (req, res) => {
  try {
    const { highlightId } = req.params

    const highlightDoc = await Highlight.findById(highlightId)
    if (!highlightDoc) {
      return res.status(404).json({ success: false, msg: 'Highlight not found' })
    }

    await Highlight.findByIdAndDelete(highlightId)

    return res.status(200).json({
      success: true,
      msg: 'Highlight deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while deleting Highlight')
  }
})

export const getHighlightById = asyncHandler(async (req, res) => {
  try {
    const { id } = req.params

    const highlight = await Highlight.findById(id)
    if (!highlight) {
      return res.status(404).json({ success: false, msg: 'No Highlight Found' })
    }

    return res.status(200).json({ success: true, highlight })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while getting Highlight')
  }
})

export const getAllNoPage = asyncHandler(async (req, res) => {
  try {
    const highlights = await Highlight.find();

    if (!highlights) {
      return res.status(404).json({ success: false, msg: 'No Highlight Found' })
    }

    return res.status(200).json({ success: true, highlights })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Highlights')
  }
})

export const toggleTopHighlight = asyncHandler(async (req, res) => {
  try {
    const { highlightId } = req.body;

    if (!highlightId) {
      return res.status(400).json({
        success: false,
        msg: "highlightId is required",
      });
    }

    const highlightDoc = await Highlight.findById(highlightId);
    if (!highlightDoc) {
      return res.status(404).json({
        success: false,
        msg: "Highlight not found",
      });
    }

    // Toggle the value
    highlightDoc.isTop = !highlightDoc.isTop;

    await highlightDoc.save();

    return res.status(200).json({
      success: true,
      msg: `Highlight isTop updated to ${highlightDoc.isTop}`,
      highlight: highlightDoc,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error, "Error while toggling isTop");
  }
});
