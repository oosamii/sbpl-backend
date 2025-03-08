import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const blogSchema = new mongoose.Schema(
  {
    title: reqString,
    subtitle: reqString,
    description: reqString,
    video: String,
    image: reqString,
  },
  {
    timestamps: true,
  }
)

const Blog = mongoose.model('Blog', blogSchema)

export default Blog
