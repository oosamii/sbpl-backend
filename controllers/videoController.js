import asyncHandler from 'express-async-handler'
import Video from '../schemas/videoSchema.js'
import { paginate } from '../manager/finder.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
} from '../utils/responseHandlers.js'

export const createVideo = asyncHandler(async (req, res) => {
  try {
    const { videoUrl, title } = req.body

    let videoDoc = await Video.findOne({ videoUrl })
    if (videoDoc) {
      return handleAlreadyExists(res, 'Video', videoUrl)
    }

    videoDoc = await Video.create({
      videoUrl,
      title,
    })

    return res.status(200).json({
      success: true,
      video: videoDoc,
      msg: 'Video Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Video')
  }
})

export const getAllVideos = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    }

    const { documents: videos, pagination } = await paginate(Video, {}, options)

    return res.status(200).json({
      success: true,
      videos,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Videos')
  }
})

export const updateVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId, videoUrl, title } = req.body

    // Find the video by ID
    let videoDoc = await Video.findById(videoId)
    if (!videoDoc) {
      return res.status(404).json({ success: false, msg: 'Video not found' })
    }

    // Check if the new videoUrl already exists (avoid duplicate URLs)
    if (videoUrl && videoUrl !== videoDoc.videoUrl) {
      let existingVideo = await Video.findOne({ videoUrl })
      if (existingVideo) {
        return handleAlreadyExists(res, 'Video', videoUrl)
      }
    }

    // Update fields
    videoDoc.videoUrl = videoUrl || videoDoc.videoUrl
    videoDoc.title = title || videoDoc.title

    await videoDoc.save()

    return res.status(200).json({
      success: true,
      video: videoDoc,
      msg: 'Video updated successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while updating Video')
  }
})

export const deleteVideo = asyncHandler(async (req, res) => {
  try {
    const { videoId } = req.params

    const videoDoc = await Video.findById(videoId)
    if (!videoDoc) {
      return res.status(404).json({ success: false, msg: 'Video not found' })
    }

    await Video.findByIdAndDelete(videoId)

    return res.status(200).json({
      success: true,
      msg: 'Video deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while deleting Video')
  }
})
