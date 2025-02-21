import bcrypt from "bcryptjs";
import asyncHandler from "express-async-handler";
import mongoose from "mongoose";
import { paginate } from "../manager/finder.js";
import User from "../schemas/userSchema.js";
import { sendEmail } from "../utils/emailSender.js";
import {
  handleAlreadyExists,
  handleErrorResponse,
  handleNotFound,
} from "../utils/responseHandlers.js";

export const createAdminUser = asyncHandler(async (req, res) => {
  try {
    const { username, email, phone, password } = req.body;

    let userDoc = await User.findOne({ email });
    if (userDoc) {
      return handleAlreadyExists(res, "User", email);
    }
    userDoc = await User.findOne({ phone });
    if (userDoc) {
      return handleAlreadyExists(res, "User", phone);
    }

    userDoc = await User.create({
      username,
      email,
      phone,
      password,
      role: "ADMIN",
    });

    console.log("Admin User created successfully", userDoc);

    return res.status(200).json({
      success: true,
      userDoc,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error, "Error while creating Admin user");
  }
});

export const loginUser = asyncHandler(async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, msg: "Invalid email" });
    }

    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, msg: "Invalid password" });
    }

    const token = user.getSignedJwtToken();

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    return handleErrorResponse(res, error, "Error during login");
  }
});

export const getAllUsers = asyncHandler(async (req, res) => {
  try {
    const options = {
      page: req.query.page,
      pageSize: req.query.pageSize,
      sortField: req.query.sortField || "createdAt",
      sortOrder: req.query.sortOrder || "asc",
    };

    const { documents: users, pagination } = await paginate(User, {}, options);
    return res.status(200).json({
      success: true,
      users,
      pagination,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error, "Error while fetching users");
  }
});

export const getUserByToken = asyncHandler(async (req, res) => {
  try {
    return res.status(200).json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
});

export const deleteUser = asyncHandler(async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) return handleNotFound(res, "User", userId);

    const user = await User.findByIdAndDelete(userId);
    if (!user) return handleNotFound(res, "User", userId);

    return res.status(200).json({
      success: true,
      msg: "User deleted successfully",
      user,
    });
  } catch (error) {
    console.log(error);
    return handleErrorResponse(res, error);
  }
});

export const generateOtp = asyncHandler(async (req, res) => {
  try {
    const email = req.params.email;
    let userDoc = await User.findOne({ email });
    if (!userDoc) {
      return res.status(404).json({
        success: false,
        msg: "User not found for the provided Email Id.",
      });
    }
    const otp = generateSecureNumericOTP(4);
    userDoc.otp = otp;
    await userDoc.save();
    await sendEmail(
      email,
      "Password Reset",
    );

    return res.status(200).json({
      success: true,
      userDoc,
      msg: "OTP Sent Successfully",
    });
  } catch (error) {
    console.error(error);
    return res
      .status(500)
      .json({ success: false, error: "Internal Server Error" });
  }
});

export const verifyEmailOtp = asyncHandler(async (req, res) => {
  try {
    const { otp, userId } = req.params;
    const userDoc = await User.findOne({
      _id: userId,
    });

    if (!userDoc) {
      console.log("Invalid user id or OTP has expired: " + userId);
      return res.status(400).json({
        success: false,
        msg: "Invalid user id or OTP has expired",
      });
    }

    if (otp != userDoc.otp) {
      console.log("Invalid OTP: " + otp);
      return res.status(400).json({
        success: false,
        msg: "Invalid OTP: " + otp,
      });
    }

    return res.status(200).json({
      success: true,
      userDoc,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});

export const resetPassword = asyncHandler(async (req, res) => {
  try {
    const { userId, password } = req.params;
    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, msg: `User Id Not Found ${userId}` });
    }
    userDoc.password = password;
    await userDoc.save();
    return res
      .status(200)
      .json({ success: true, msg: "Password Updated Successfully",userDoc });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message, success: false });
  }
});

function generateSecureNumericOTP(length) {
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += Math.floor(Math.random() * 10); 
  }
  return otp;
}

