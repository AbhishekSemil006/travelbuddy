import { User } from '../models/userModel.js';
import { Trip } from '../models/tripModel.js';
import { Profile } from '../models/profileModel.js';
import { Report } from '../models/reportModel.js';
import { AppError } from '../utils/appError.js';
import mongoose from "mongoose";

// Allowed fields for admin trip updates
const ALLOWED_ADMIN_TRIP_FIELDS = [
  'title', 'description', 'destination', 'status', 'visibility',
];

const filterObj = (obj, allowedFields) => {
  const newObj = {};
  Object.keys(obj).forEach((key) => {
    if (allowedFields.includes(key)) {
      newObj[key] = obj[key];
    }
  });
  return newObj;
};

// Dashboard stats
export const getDashboardStats = async (req, res, next) => {
  try {
    const [users, trips, pendingReports, pendingVerifications] = await Promise.all([
      User.countDocuments(),
      Trip.countDocuments(),
      Report.countDocuments({ status: 'pending' }),
      User.countDocuments({ verificationStatus: 'pending' }),
    ]);

    res.status(200).json({
      success: true,
      data: { users, trips, pendingReports, pendingVerifications }
    });
  } catch (err) {
    next(err);
  }
};

// Get all users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password -passwordResetToken -verificationToken -blockedUsers');

    res.status(200).json({
      success: true,
      results: users.length,
      data: users
    });
  } catch (err) {
    next(err);
  }
};

// User Operations
export const toggleUserBlock = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot block admins', 403));

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: `User ${user.status}`, user });
  } catch (err) {
    next(err);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));
    if (user.role === 'admin') return next(new AppError('Cannot delete admins', 403));

    // Cascade delete profile and trips
    await Profile.findOneAndDelete({ user: user._id });
    await Trip.deleteMany({ creator: user._id });
    
    // Hard delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    next(err);
  }
};

// Validation handled by route middleware (adminFineSchema)
export const fineUser = async (req, res, next) => {
  try {
    const { amount } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) return next(new AppError('User not found', 404));

    user.fineAmount = (user.fineAmount || 0) + amount;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ success: true, message: `Fined $${amount}`, user });
  } catch (err) {
    next(err);
  }
};

export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.isVerified = true;
    user.verificationStatus = "approved";

    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "User verified successfully",
      data: { user },
    });

  } catch (err) {
    next(err);
  }
};

// Trip Operations
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find().populate('creator', 'name email');

    res.status(200).json({
      success: true,
      results: trips.length,
      data: trips
    });
  } catch (err) {
    next(err);
  }
};

export const getTripDetails = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('creator', 'name email');
    if (!trip) return next(new AppError('Trip not found', 404));

    // Populate all participants too
    const userIds = trip.participants.map((p) => p.user);
    const profiles = await Profile.find({ user: { $in: userIds } });
    const profileMap = {};
    profiles.forEach((pr) => {
      profileMap[pr.user.toString()] = pr;
    });

    const participants = trip.participants.map((p) => ({
      ...p.toObject(),
      profile: profileMap[p.user.toString()] 
        ? { displayName: profileMap[p.user.toString()].displayName } 
        : { displayName: 'Unknown' },
    }));

    res.status(200).json({
      success: true,
      data: { ...trip.toObject(), participants }
    });
  } catch (err) {
    next(err);
  }
};

// Validation handled by route middleware (adminUpdateTripSchema)
export const updateTrip = async (req, res, next) => {
  try {
    // Whitelist allowed admin trip update fields
    const filteredBody = filterObj(req.body, ALLOWED_ADMIN_TRIP_FIELDS);

    const trip = await Trip.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });
    if (!trip) return next(new AppError('Trip not found', 404));

    res.status(200).json({ success: true, data: trip });
  } catch (err) {
    next(err);
  }
};

export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));

    res.status(200).json({ success: true, message: 'Trip deleted forcefully' });
  } catch (err) {
    next(err);
  }
};

// Audit logs (basic version)
export const getAuditLogs = async (req, res, next) => {
  try {
    const logs = [
      { action: 'User Created', user: 'John', time: new Date() },
      { action: 'Trip Booked', user: 'Alice', time: new Date() }
    ];

    res.status(200).json({
      success: true,
      data: logs
    });
  } catch (err) {
    next(err);
  }
};

// ── REPORT MANAGEMENT ─────────────────────────────────────────
export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;

    // Validate status query param if provided
    const validStatuses = ['pending', 'reviewed', 'dismissed', 'actioned'];
    const filter = {};
    if (status) {
      if (!validStatuses.includes(status)) {
        return next(new AppError('Invalid status filter', 400));
      }
      filter.status = status;
    }

    const reports = await Report.find(filter)
      .sort('-createdAt')
      .populate('reporter', 'name email')
      .populate('reportedUser', 'name email')
      .lean();

    const enriched = await Promise.all(
      reports.map(async (r) => {
        const reporterProfile = await Profile.findOne({ user: r.reporter._id }).lean();
        const reportedProfile = await Profile.findOne({ user: r.reportedUser._id }).lean();

        return {
          id: r._id.toString(),
          reporter: {
            id: r.reporter._id.toString(),
            name: reporterProfile?.displayName || r.reporter.name,
            email: r.reporter.email,
          },
          reportedUser: {
            id: r.reportedUser._id.toString(),
            name: reportedProfile?.displayName || r.reportedUser.name,
            email: r.reportedUser.email,
          },
          reason: r.reason,
          description: r.description,
          status: r.status,
          adminNotes: r.adminNotes,
          created_at: r.createdAt,
        };
      })
    );

    res.status(200).json({ success: true, data: enriched });
  } catch (err) {
    next(err);
  }
};

// Validation handled by route middleware (adminReportStatusSchema)
export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status, adminNotes: adminNotes || undefined },
      { new: true, runValidators: true }
    );

    if (!report) return next(new AppError('Report not found', 404));

    res.status(200).json({
      success: true,
      data: {
        id: report._id.toString(),
        status: report.status,
        adminNotes: report.adminNotes,
      },
    });
  } catch (err) {
    next(err);
  }
};