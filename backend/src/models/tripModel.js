import mongoose from 'mongoose';

const tripSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Trip must have a creator'],
    },
    title: {
      type: String,
      required: [true, 'Trip must have a title'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    destination: {
      type: String,
      required: [true, 'Trip must have a destination'],
    },
    startDate: {
      type: Date,
      required: [true, 'Trip must have a start date'],
    },
    endDate: {
      type: Date,
      required: [true, 'Trip must have an end date'],
    },
    budgetMin: Number,
    budgetMax: Number,
    maxParticipants: {
      type: Number,
      required: [true, 'Trip must define max participants'],
      default: 4,
    },
    participants: [
      {
        user: {
          type: mongoose.Schema.ObjectId,
          ref: 'User',
        },
        status: {
          type: String,
          enum: ['pending', 'requested', 'accepted', 'declined'],
          default: 'pending',
        },
        joinedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    visibility: {
      type: String,
      enum: ['public', 'private'],
      default: 'public',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'completed', 'cancelled'],
      default: 'active',
    },
    femaleOnly: {
      type: Boolean,
      default: false,
    },
    interests: {
      type: [String],
      default: [],
    },
    coverImageUrl: String,
  },
  {
    timestamps: true,
  }
);

// Indexes for searching
tripSchema.index({ destination: 1, status: 1 });
tripSchema.index({ startDate: 1 });

export const Trip = mongoose.model('Trip', tripSchema);
