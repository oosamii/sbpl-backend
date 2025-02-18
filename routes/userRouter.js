import express from 'express'
import {
  createAdminUser,
  deleteUser,
  getAllUsers,
  getUserByToken,
} from '../controllers/userController.js'
import { authorize, protect } from '../middlewares/authMiddleware.js'

const userRouter = express.Router()

userRouter.route('/createAdmin').post(createAdminUser)
userRouter.route('/getAll').get(protect, authorize('ADMIN'), getAllUsers)
userRouter.route('/getUserByToken').get(protect, getUserByToken)
userRouter
  .route('/deleteUser/:userId')
  .delete(protect, authorize('ADMIN'), deleteUser)

userRouter.get('/admin-only', protect, authorize('ADMIN'), (req, res) => {
  res.status(200).json({ success: true, message: 'Welcome Admin!' })
})

export default userRouter
