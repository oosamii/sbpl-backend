import expressRouter from 'express'
import authRouter from './authRouter.js'
import influencerRouter from './influencerRouter.js'
import phonePeRouter from './phonePeRouter.js'
import playerRouter from './playerRouter.js'
import razorPayRouter from './razorpayRouter.js'
import userRouter from './userRouter.js'
import videoRouter from './videoRouter.js'
import blogRouter from './blogRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)
appRoutes.use('/auth', authRouter)
appRoutes.use('/player', playerRouter)
appRoutes.use('/influencer', influencerRouter)
appRoutes.use('/razorpay', razorPayRouter)
appRoutes.use('/phonepe', phonePeRouter)
appRoutes.use('/video', videoRouter)
appRoutes.use('/blog', blogRouter)
export default appRoutes
