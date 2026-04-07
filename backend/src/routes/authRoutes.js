import express from 'express';
import { register, login, logout, refreshToken } from '../controllers/authController.js';

export const authRouter = express.Router();

authRouter.post('/register', register);
authRouter.post('/login', login);
authRouter.get('/logout', logout); // or POST
authRouter.get('/refresh-token', refreshToken); // or POST

export default authRouter;
