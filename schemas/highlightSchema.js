import mongoose from 'mongoose';

const highlightSchema = mongoose.Schema(
  {
    title: String,
    description: String,
    mediaUrl: String,
    isTop: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

const Highlight = mongoose.model('highlights', highlightSchema)
export default Highlight
