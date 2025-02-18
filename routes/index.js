import expressRouter from 'express'
import authRouter from './authRouter.js'
import userRouter from './userRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)
appRoutes.use('/auth', authRouter)

export default appRoutes
