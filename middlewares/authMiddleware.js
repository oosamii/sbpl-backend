import asyncHandler from 'express-async-handler'
import jwt from 'jsonwebtoken'
import User from '../schemas/userSchema.js'

export const protect = asyncHandler(async (req, res, next) => {
  let token = req.headers.authorization

  if (!token || !token.startsWith('Bearer ')) {
    return res
      .status(401)
      .json({ success: false, message: 'Not authorized, no token' })
  }

  try {
    token = token.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)

    req.user = await User.findById(decoded.id).select('-password')
    //TODO: Add logic to fetch the Player , Influencer object from here
    next()
  } catch (error) {
    res
      .status(401)
      .json({ success: false, msg: 'Not authorized, invalid token' })
  }
})

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ success: false, msg: 'Access denied' })
    }
    next()
  }
}
