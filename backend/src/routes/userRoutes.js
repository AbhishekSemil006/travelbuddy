import express from 'express';
import multer from 'multer';
import { getMe, updateMe, uploadGovernmentId } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';

export const userRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Protect all routes after this middleware
userRouter.use(protect);

userRouter.get('/me', getMe);
userRouter.patch('/me', updateMe);

// Route for uploading government ID
userRouter.post('/me/upload-id', upload.single('file'), uploadGovernmentId);

export default userRouter;
