import asyncHandler from 'express-async-handler'
import { paginate } from '../manager/finder.js'
import Blog from '../schemas/blogSchema.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
} from '../utils/responseHandlers.js'

export const createBlog = asyncHandler(async (req, res) => {
  try {
    const { title, subtitle, description, video, image } = req.body

    let blogDoc = await Blog.findOne({ title })
    if (blogDoc) {
      return handleAlreadyExists(res, 'Blog', title)
    }

    blogDoc = await Blog.create({
      title,
      subtitle,
      description,
      video,
      image,
    })

    return res.status(200).json({
      success: true,
      blog: blogDoc,
      msg: 'Blog Created Successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while creating Blog')
  }
})

export const getAllBlogs = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || 'createdAt',
      sortOrder: req.query.sortOrder || 'desc',
    }

    const { documents: blogs, pagination } = await paginate(Blog, {}, options)

    return res.status(200).json({
      success: true,
      blogs,
      pagination,
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while fetching Blogs')
  }
})

export const updateBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId, title, subtitle, description, video, image } = req.body

    let blogDoc = await Blog.findById(blogId)
    if (!blogDoc) {
      return res.status(404).json({ success: false, msg: 'Blog not found' })
    }

    blogDoc.title = title || blogDoc.title
    blogDoc.subtitle = subtitle || blogDoc.subtitle
    blogDoc.description = description || blogDoc.description
    blogDoc.video = video || blogDoc.video
    blogDoc.image = image || blogDoc.image

    await blogDoc.save()

    return res.status(200).json({
      success: true,
      blog: blogDoc,
      msg: 'Blog updated successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while updating Blog')
  }
})

export const deleteBlog = asyncHandler(async (req, res) => {
  try {
    const { blogId } = req.params

    const blogDoc = await Blog.findById(blogId)
    if (!blogDoc) {
      return res.status(404).json({ success: false, msg: 'Blog not found' })
    }

    await Blog.findByIdAndDelete(blogId)

    return res.status(200).json({
      success: true,
      msg: 'Blog deleted successfully',
    })
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while deleting Blog')
  }
})

export const getBlogById = asyncHandler(async (req, res) => {
  try {
    const id = req.params.id;

    const blog = await Blog.findById(id);
    if (!blog) {
      return res.status(404).json({ success: false, msg: "No Blogs Found" });
    }

    return res.status(200).json({ success: true, blog });
  } catch (error) {
    console.log(error)
    return handleErrorResponse(res, error, 'Error while getting Blog')
  }
})
