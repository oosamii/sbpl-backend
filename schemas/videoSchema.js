import mongoose from 'mongoose'
import { reqString } from '../constants/types.js'

const videoSchema = new mongoose.Schema(
  {
    videoUrl: reqString,
    title: reqString,
  },
  {
    timestamps: true,
  }
)

const Video = mongoose.model('Video', videoSchema)

export default Video
