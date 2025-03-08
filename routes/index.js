import expressRouter from 'express'
import authRouter from './authRouter.js'
import influencerRouter from './influencerRouter.js'
import payuRouter from './payuRouter.js'
import phonePeRouter from './phonePeRouter.js'
import playerRouter from './playerRouter.js'
import razorPayRouter from './razorpayRouter.js'
import userRouter from './userRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)
appRoutes.use('/auth', authRouter)
appRoutes.use('/player', playerRouter)
appRoutes.use('/influencer', influencerRouter)
appRoutes.use('/razorpay', razorPayRouter)
appRoutes.use('/phonepe', phonePeRouter)
appRoutes.use('/payu', payuRouter)
export default appRoutes
