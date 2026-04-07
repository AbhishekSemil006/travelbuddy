import express from 'express';
import { getMe, updateMe } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

export const userRouter = express.Router();

// Protect all routes after this middleware
userRouter.use(protect);

userRouter.get('/me', getMe);
userRouter.patch('/me', updateMe);

export default userRouter;
