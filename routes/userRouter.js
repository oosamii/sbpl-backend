import express from 'express'
import { createAdminUser } from '../controllers/userController.js'

const userRouter = express.Router()

userRouter.route('/createAdmin').post(createAdminUser)

export default userRouter
