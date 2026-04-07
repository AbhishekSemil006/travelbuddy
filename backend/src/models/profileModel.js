import mongoose from 'mongoose';

const profileSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Profile must belong to a user'],
      unique: true,
    },
    displayName: {
      type: String,
      trim: true,
      maxlength: [50, 'Display name must be less or equal to 50 characters'],
    },
    avatarUrl: {
      type: String,
    },
    bio: {
      type: String,
      trim: true,
      maxlength: [300, 'Bio must be less or equal to 300 characters'],
    },
    gender: {
      type: String,
      enum: ['male', 'female', 'non_binary'],
    },
    dateOfBirth: Date,
    languages: {
      type: [String],
      default: [],
    },
    interests: {
      type: [String],
      default: [],
    },
    emergencyContacts: [
      {
        name: String,
        phone: String,
        relationship: String,
        isPrimary: {
          type: Boolean,
          default: false,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

export const Profile = mongoose.model('Profile', profileSchema);
