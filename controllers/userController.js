import asyncHandler from 'express-async-handler'
import { paginate } from '../manager/finder.js'
import User from '../schemas/userSchema.js'
import { sendEmail } from '../utils/emailSender.js'
import {
  handleAlreadyExists,
  handleErrorResponse,
  handleNotFound,
} from "../utils/responseHandlers.js"

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
})

function generateSecureNumericOTP(length) {
  length = 4;

  const digits = "0123456789";
  const digitsLength = digits.length;

  const array = new Uint32Array(length);

  crypto.getRandomValues(array);

  const otp = Array.from(array, (value) => digits[value % digitsLength]).join(
    ""
  );
  if (otp.length === length) {
    return otp;
  }
  return generateSecureNumericOTP(length);
}

/* export const forgotPassword = asyncHandler(async (req, res) => {
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
*/
export const resetAdminPassword = asyncHandler(async (req, res) => {
  try {
    const { userId, oldPassword, newPassword } = req.body;

    const userDoc = await User.findById(userId);
    if (!userDoc) {
      return res
        .status(404)
        .json({ success: false, msg: `User Id Not Found ${userId}` });
    }
    if (userDoc.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        message: 'Unauthorized: Only admins can reset passwords',
      })
    }

    const isMatch = await userDoc.matchPassword(oldPassword)
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Incorrect old password',
      })
    }

    userDoc.password = newPassword;
    await userDoc.save();
    return res
      .status(200)
      .json({ success: true, msg: "Password Updated Successfully", userDoc });
  } catch (error) {
    console.error('Error in resetPassword:', error)
    return res
      .status(500)
      .json({ success: false, msg: 'Internal Server Error' })
  }
})

export const triggerEmailOtp = asyncHandler(async (req, res) => {
  try {
    const { email } = req.body;
    let userDoc = await User.findOne({ email: email });
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
      `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>OTP Verification</title>
      </head>
      <body>
        <div
          style="
            max-width: 600px;
            margin: 0 auto;
            padding: 20px;
            background-color: #f9f9f9;
            border-radius: 10px;
            font-family: Arial, sans-serif;
            color: #333;
          "
        >
          <div
            style="
              text-align: center;
              padding: 20px;
              background-color: #5356fb;
              border-radius: 10px 10px 0 0;
            "
          >
            <h1 style="color: white; margin: 0">OTP Verification</h1>
          </div>
          <div
            style="
              padding: 20px;
              background: rgba(255, 255, 255, 0.6);
              backdrop-filter: blur(5px);
              border-radius: 0 0 10px 10px;
              box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
            "
          >
            <p style="margin: 0 0 15px">Dear User,</p>
            <p style="margin: 0 0 15px">
              Your One-Time Password (OTP) for verification is:
            </p>

            <div
              style="
                margin: 20px 0;
                font-size: 24px;
                font-weight: bold;
                text-align: center;
                padding: 10px;
                border-radius: 10px;
                background: linear-gradient(90deg, #5356fb, #f539f8);
                color: white;
              "
            >
              ${otp}
            </div>

            <p style="margin: 0 0 15px">
              Please enter this code on the verification screen to proceed.
            </p>
            <p style="margin: 0 0 15px">
              If you did not request this, please ignore this email.
            </p>
          </div>
          <div
            style="
              text-align: center;
              margin-top: 10px;
              padding: 15px;
              background-color: #f0f0f0;
              border-radius: 10px;
            "
          >
            <p style="margin: 0">Thank you for using our service!</p>
            <p style="margin: 0; margin-top: 5px; font-size: 12px; color: #777">
              &copy; 2025
              <a style="text-decoration: none" href="https://demo.sbpl-tc.com/"
                >South Bharath Premier League</a
              >
              powered by
              <a
                style="text-decoration: none"
                href="https://www.orbittechnologys.com/"
                >Orbit Technologys</a
              >
              . All rights reserved.
            </p>
          </div>
        </div>
      </body>
    </html>
`
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
    const { otp, userId } = req.body;
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
    const { email, newPassword } = req.body

    const user = await User.findOne({ email })
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' })
    }

    // const salt = await bcrypt.genSalt(10)
    // user.password = await bcrypt.hash(newPassword, salt)
    user.password = newPassword;
    await user.save()

    return res.status(200).json({ success: true, message: 'Password reset successfully' })

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      success: false,
      error,
    });
  }
});
