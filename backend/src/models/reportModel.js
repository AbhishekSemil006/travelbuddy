import mongoose from 'mongoose';

const reportSchema = new mongoose.Schema(
  {
    reporter: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Report must have a reporter'],
    },
    reportedUser: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      required: [true, 'Report must have a reported user'],
    },
    conversation: {
      type: mongoose.Schema.ObjectId,
      ref: 'Conversation',
      required: true,
    },
    message: {
      type: mongoose.Schema.ObjectId,
      ref: 'Message',
    },
    reason: {
      type: String,
      enum: [
        'spam',
        'harassment',
        'inappropriate_content',
        'scam',
        'fake_profile',
        'threats',
        'other',
      ],
      required: [true, 'Report must have a reason'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'reviewed', 'dismissed', 'actioned'],
      default: 'pending',
    },
    adminNotes: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

reportSchema.index({ reporter: 1 });
reportSchema.index({ reportedUser: 1 });
reportSchema.index({ status: 1 });

export const Report = mongoose.model('Report', reportSchema);
