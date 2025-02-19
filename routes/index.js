import expressRouter from 'express'
import authRouter from './authRouter.js'
import influencerRouter from './influencerRouter.js'
import playerRouter from './playerRouter.js'
import razorPayRouter from './razorpayRouter.js'
import userRouter from './userRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)
appRoutes.use('/auth', authRouter)
appRoutes.use('/player', playerRouter)
appRoutes.use('/influencer', influencerRouter)
appRoutes.use('/razorpay', razorPayRouter)
export default appRoutes
