import mongoose from "mongoose";
import { User } from '../models/userModel.js';
import { Profile } from '../models/profileModel.js';
import { AppError } from '../utils/appError.js';

// Allowed profile fields that users can update
const ALLOWED_PROFILE_FIELDS = [
  'displayName', 'bio', 'gender', 'interests', 'languages', 'dateOfBirth',
];

/**
 * Filter an object to only include allowed fields
 */
const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Allowed MIME types for image uploads
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Validate uploaded file type and size
 */
const validateImageFile = (file) => {
  if (!ALLOWED_IMAGE_TYPES.includes(file.mimetype)) {
    return 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.';
  }
  if (file.size > MAX_FILE_SIZE) {
    return 'File too large. Maximum size is 5MB.';
  }
  return null;
};

export const getMe = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    
    // Merge profile data into user object for frontend consumption
    const userData = {
      _id: req.user._id,
      id: req.user._id.toString(),
      email: req.user.email,
      mobileNo: req.user.mobileNo || '',
      fullName: profile?.displayName || req.user.name || 'User',
      avatarUrl: profile?.avatarUrl || null,
      role: req.user.role || 'user',
      authProvider: req.user.authProvider || 'local',
    };

    res.status(200).json({
      status: 'success',
      data: {
        user: userData,
        profile: profile || null
      }
    });
  } catch (err) {
    next(err);
  }
};

// Validation handled by route middleware (profileUpdateSchema)
export const updateMe = async (req, res, next) => {
  try {
    // Filter to only allowed profile fields (defense in depth — Zod already strips unknowns)
    const filteredBody = filterObj(req.body, ALLOWED_PROFILE_FIELDS);

    // Upsert — creates the profile if it doesn't exist yet (new user)
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { ...filteredBody, user: req.user._id },
      {
        new: true,
        runValidators: true,
        upsert: true,
      }
    );

    res.status(200).json({
      status: 'success',
      data: {
        profile: updatedProfile
      }
    });

  } catch (err) {
    next(err);
  }
};

export const uploadGovernmentId = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    // Validate file type and size
    const fileError = validateImageFile(req.file);
    if (fileError) {
      return next(new AppError(fileError, 400));
    }

    // uploadToCloudinary handles the buffer
    const { uploadToCloudinary } = await import('../utils/cloudinary.js');
    const result = await uploadToCloudinary(req.file.buffer, 'travelbuddy_users_ids');

    // Update the user's governmentId field and set verification status to pending
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        governmentId: result.secure_url,
        isVerified: false,
        verificationStatus: 'pending',
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Government ID uploaded successfully',
      data: {
        user: {
          _id: user._id,
          verificationStatus: user.verificationStatus,
        }
      }
    });
  } catch (err) {
    next(err);
  }
};

export const uploadAvatar = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    // Validate file type and size
    const fileError = validateImageFile(req.file);
    if (fileError) {
      return next(new AppError(fileError, 400));
    }

    const { uploadToCloudinary } = await import('../utils/cloudinary.js');
    const result = await uploadToCloudinary(req.file.buffer, 'travelbuddy_avatars');

    // Update (or upsert) the profile's avatarUrl field
    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      { avatarUrl: result.secure_url },
      { new: true, runValidators: true, upsert: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Avatar uploaded successfully',
      data: {
        avatarUrl: result.secure_url,
        profile: updatedProfile,
      }
    });
  } catch (err) {
    next(err);
  }
};
