import express from 'express';
import multer from 'multer';
import { getMe, updateMe, uploadGovernmentId, uploadAvatar } from '../controllers/userController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { profileUpdateSchema } from '../utils/validators.js';

export const userRouter = express.Router();

const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max
    files: 1,
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'), false);
    }
  },
});

// Protect all routes after this middleware
userRouter.use(protect);

userRouter.get('/me', getMe);
userRouter.patch('/me', validate(profileUpdateSchema), updateMe);

// Route for uploading profile avatar
userRouter.post('/me/upload-avatar', upload.single('file'), uploadAvatar);

// Route for uploading government ID
userRouter.post('/me/upload-id', upload.single('file'), uploadGovernmentId);

export default userRouter;
