import expressRouter from 'express'
import userRouter from './userRouter.js'

const appRoutes = expressRouter()

appRoutes.use('/user', userRouter)

export default appRoutes
