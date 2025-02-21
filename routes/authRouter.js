import express from 'express';
import {
  loginUser,
  resetPassword,
  triggerEmailOtp,
  verifyEmailOtp
} from '../controllers/userController.js';

const authRouter = express.Router();

authRouter.post('/login', loginUser);
authRouter.route("/triggerEmailOtp").post(triggerEmailOtp);
authRouter.route("/verifyEmailOtp").post(verifyEmailOtp);
authRouter.route("/resetPassword").post(resetPassword);

export default authRouter;
