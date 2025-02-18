import express from 'express'
import { createAdminUser } from '../controllers/userController.js'
import { authorize, protect } from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

userRouter.route('/createAdmin').post(createAdminUser)
userRouter.get('/admin-only', protect, authorize('ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin!' })
})

export default userRouter
