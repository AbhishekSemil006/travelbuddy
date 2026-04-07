import { User } from '../models/userModel.js';
import { Profile } from '../models/profileModel.js';
import { AppError } from '../utils/appError.js';

export const getMe = async (req, res, next) => {
  try {
    const profile = await Profile.findOne({ user: req.user._id });
    
    // Return success even if profile is not created yet (resilient sync)
    res.status(200).json({
      status: 'success',
      data: {
        user: req.user,
        profile: profile || null
      }
    });
  } catch (err) {
    next(err);
  }
};

export const updateMe = async (req, res, next) => {
  try {
    // Filter out unwanted fields (like password, role, isVerified)
    const filteredBody = req.body; // In production use a filter function

    const updatedProfile = await Profile.findOneAndUpdate(
      { user: req.user._id },
      filteredBody,
      {
        new: true,
        runValidators: true
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

    // uploadToCloudinary handles the buffer
    const { uploadToCloudinary } = await import('../utils/cloudinary.js');
    const result = await uploadToCloudinary(req.file.buffer, 'travelbuddy_users_ids');

    // Update the user's governmentId field
    const user = await User.findByIdAndUpdate(
      req.user._id,
      { 
        governmentId: result.secure_url,
        isVerified: false // Needs re-verification after uploading new ID
      },
      { new: true, runValidators: true }
    );

    res.status(200).json({
      status: 'success',
      message: 'Government ID uploaded successfully',
      data: {
        user
      }
    });
  } catch (err) {
    next(err);
  }
};
