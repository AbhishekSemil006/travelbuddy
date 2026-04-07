import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Notification must have a recipient'],
      index: true,
    },
    sender: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'join_request',
        'request_accepted',
        'request_declined',
        'participant_removed',
        'new_message',
        'trip_update',
      ],
      required: true,
    },
    tripId: {
      type: mongoose.Schema.ObjectId,
      ref: 'Trip',
    },
    message: {
      type: String,
      required: true,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Index for fast fetching
notificationSchema.index({ recipient: 1, createdAt: -1 });

export const Notification = mongoose.model('Notification', notificationSchema);
