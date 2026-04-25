import express from 'express';
import { register, login, logout, refreshToken, googleSignIn } from '../controllers/authController.js';
import { validate } from '../middleware/validateRequest.js';
import { registerSchema, loginSchema, googleSignInSchema } from '../utils/validators.js';

export const authRouter = express.Router();

authRouter.post('/register', validate(registerSchema), register);
authRouter.post('/login', validate(loginSchema), login);
authRouter.post('/google', validate(googleSignInSchema), googleSignIn);
authRouter.get('/logout', logout);
authRouter.get('/refresh-token', refreshToken);

export default authRouter;
