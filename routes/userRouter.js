import express from 'express'
import {
  checkUserExists,
  checkUserExistsByEmail,
  createAdminUser,
  deleteUser,
  // forgotPassword,
  getAllUsers,
  getUserByToken,
  resetAdminPassword,
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
// userRouter.route('/forgotPassword').post(forgotPassword)
userRouter.route('/resetAdminPassword').post(resetAdminPassword)
userRouter.route('/exists/:phone').post(checkUserExists)
userRouter.route('/existsByEmail/:email').post(checkUserExistsByEmail)

export default userRouter
