import mongoose from "mongoose";

const headerSchema = mongoose.Schema(
  {
    title: String,
    description: String,
  },
  {
    timestamps: true,
  }
);

const Header = mongoose.model('header', headerSchema)
export default Header
