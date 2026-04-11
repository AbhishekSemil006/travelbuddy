import { User } from '../models/userModel.js';
import { Trip } from '../models/tripModel.js';
import { Profile } from '../models/profileModel.js';
import { Report } from '../models/reportModel.js';
import { AppError } from '../utils/appError.js';
import mongoose from "mongoose";


// Dashboard stats
export const getDashboardStats = async (req, res) => {
  try {
    const users = await User.countDocuments();
    const trips = await Trip.countDocuments();

    res.json({
      success: true,
      data: { users, trips }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Get all users
export const getAllUsers = async (req, res) => {
  const users = await User.find().select('-password');

  res.json({
    success: true,
    results: users.length,
    data: users
  });
};

// User Operations
export const toggleUserBlock = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot block admins' });

    user.status = user.status === 'blocked' ? 'active' : 'blocked';
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.status}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.role === 'admin') return res.status(403).json({ message: 'Cannot delete admins' });

    // Cascade delete profile and trips
    await Profile.findOneAndDelete({ user: user._id });
    await Trip.deleteMany({ creator: user._id });
    
    // Hard delete user
    await User.findByIdAndDelete(req.params.id);

    res.json({ success: true, message: 'User deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const fineUser = async (req, res) => {
  try {
    const { amount } = req.body;
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({ message: 'Valid positive amount required' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.fineAmount = (user.fineAmount || 0) + amount;
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `Fined $${amount}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const toggleUserVerification = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // If currently verified, unverify. Otherwise, approve.
    if (user.isVerified) {
      user.isVerified = false;
      user.verificationStatus = 'none';
    } else {
      user.isVerified = true;
      user.verificationStatus = 'approved';
    }
    await user.save({ validateBeforeSave: false });

    res.json({ success: true, message: `User ${user.isVerified ? 'verified' : 'unverified'}`, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// export const rejectVerification = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: 'User not found' });

//     user.isVerified = false;
//     user.verificationStatus = 'rejected';
//     user.governmentId = undefined; // Clear the rejected document
//     await user.save({ validateBeforeSave: false });

//     res.json({ success: true, message: 'Verification rejected', user });
//   } catch (err) {
//     res.status(500).json({ message: err.message });
//   }
// };


export const verifyUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError("User not found", 404));
    }

    user.isVerified = true;
    user.verificationStatus = "approved";

    // ✅ FIX HERE
    await user.save({ validateBeforeSave: false });

    res.status(200).json({
      status: "success",
      message: "User verified successfully",
      data: { user },
    });

  } catch (err) {
    console.error("VERIFY ERROR:", err);
    next(err);
  }
};

// Trip Operations
export const getAllTrips = async (req, res) => {
  const trips = await Trip.find().populate('creator', 'name email');

  res.json({
    success: true,
    results: trips.length,
    data: trips
  });
};

export const getTripDetails = async (req, res) => {
  try {
    const trip = await Trip.findById(req.params.id).populate('creator', 'name email');
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

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

    res.json({
      success: true,
      data: { ...trip.toObject(), participants }
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const updateTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    res.json({ success: true, data: trip });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const deleteTrip = async (req, res) => {
  try {
    const trip = await Trip.findByIdAndDelete(req.params.id);
    if (!trip) return res.status(404).json({ message: 'Trip not found' });

    res.json({ success: true, message: 'Trip deleted forcefully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Audit logs (basic version)
export const getAuditLogs = async (req, res) => {
  const logs = [
    { action: 'User Created', user: 'John', time: new Date() },
    { action: 'Trip Booked', user: 'Alice', time: new Date() }
  ];

  res.json({
    success: true,
    data: logs
  });
};

// ── REPORT MANAGEMENT ─────────────────────────────────────────
export const getReports = async (req, res, next) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : {};

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

export const updateReportStatus = async (req, res, next) => {
  try {
    const { status, adminNotes } = req.body;

    if (!status || !['reviewed', 'dismissed', 'actioned'].includes(status)) {
      return next(new AppError('Valid status required (reviewed, dismissed, actioned)', 400));
    }

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