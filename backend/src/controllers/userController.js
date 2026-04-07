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
}
