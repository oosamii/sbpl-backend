import express from 'express';
import { createAdminUser, loginUser } from '../controllers/userController.js'

const authRouter = express.Router();

authRouter.post('/login', loginUser);


export default authRouter;
