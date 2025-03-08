import expressRouter from 'express'
import authRouter from './authRouter.js'
import influencerRouter from './influencerRouter.js'
import payuRouter from './payuRouter.js'
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
<<<<<<< HEAD
appRoutes.use('/payu', payuRouter)
=======
appRoutes.use('/video', videoRouter)
appRoutes.use('/blog', blogRouter)
>>>>>>> fde4cc2c81a2bed9021c29664cb2fe4f5e2c5c34
export default appRoutes
