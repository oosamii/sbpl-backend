import express from 'express'

import {
  createBlog,
  deleteBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
} from '../controllers/blogController.js'

const blogRouter = express.Router()

blogRouter.route('/create').post(createBlog)
blogRouter.route('/getAll').get(getAllBlogs)
blogRouter.route('/update').post(updateBlog)
blogRouter.route('/delete/:blogId').delete(deleteBlog)
blogRouter.route('/getBlogById/:id').get(getBlogById)

export default blogRouter
