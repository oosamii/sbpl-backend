import expressRouter from 'express'
import authRouter from './authRouter.js'
import playerRouter from './playerRouter.js'
import userRouter from './userRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)
appRoutes.use('/auth', authRouter)
appRoutes.use('/player', playerRouter)
export default appRoutes
