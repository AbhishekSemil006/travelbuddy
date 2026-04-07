import { Trip } from '../models/tripModel.js';
import { Profile } from '../models/profileModel.js';
import { AppError } from '../utils/appError.js';

// Helper: build participant profile info
const populateParticipantProfiles = async (trip) => {
  if (!trip.participants || trip.participants.length === 0) return [];

  const userIds = trip.participants.map((p) => p.user);
  const profiles = await Profile.find({ user: { $in: userIds } });
  const profileMap = {};
  profiles.forEach((pr) => {
    profileMap[pr.user.toString()] = pr;
  });

  return trip.participants.map((p) => ({
    _id: p._id,
    id: p._id.toString(),
    userId: p.user.toString(),
    tripId: trip._id.toString(),
    status: p.status,
    joinedAt: p.joinedAt,
    profile: profileMap[p.user.toString()]
      ? {
          _id: profileMap[p.user.toString()]._id,
          display_name: profileMap[p.user.toString()].displayName,
          avatarUrl: profileMap[p.user.toString()].avatarUrl || null,
          isVerified: false,
        }
      : { _id: null, display_name: 'Unknown', avatarUrl: null, isVerified: false },
  }));
};

// Helper: get creator profile
const getCreatorProfile = async (creatorId) => {
  const profile = await Profile.findOne({ user: creatorId });
  if (!profile) return { _id: creatorId, display_name: 'Unknown', avatarUrl: null, isVerified: false };
  return {
    _id: creatorId,
    display_name: profile.displayName,
    avatarUrl: profile.avatarUrl || null,
    isVerified: false,
  };
};

// ── GET ALL TRIPS ─────────────────────────────────────────────
export const getAllTrips = async (req, res, next) => {
  try {
    const trips = await Trip.find({ visibility: 'public' })
      .populate('creator', 'name email')
      .sort('-createdAt');

    res.status(200).json({
      status: 'success',
      results: trips.length,
      data: { trips },
    });
  } catch (err) {
    next(err);
  }
};

// ── CREATE TRIP ───────────────────────────────────────────────
export const createTrip = async (req, res, next) => {
  try {
    req.body.creator = req.user._id;
    const newTrip = await Trip.create(req.body);

    res.status(201).json({
      status: 'success',
      data: { trip: newTrip },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET SINGLE TRIP (with participants + profiles) ────────────
export const getTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);

    if (!trip) {
      return next(new AppError('No trip found with that ID', 404));
    }

    const creatorProfile = await getCreatorProfile(trip.creator);
    const participants = await populateParticipantProfiles(trip);

    res.status(200).json({
      status: 'success',
      data: {
        trip: {
          ...trip.toObject(),
          creator: creatorProfile,
        },
        participants,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── UPDATE TRIP ───────────────────────────────────────────────
export const updateTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('No trip found with that ID', 404));
    if (trip.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('You are not authorized to edit this trip', 403));
    }

    const updatedTrip = await Trip.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      data: { trip: updatedTrip },
    });
  } catch (err) {
    next(err);
  }
};

// ── DELETE TRIP ───────────────────────────────────────────────
export const deleteTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('No trip found with that ID', 404));
    if (trip.creator.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return next(new AppError('You are not authorized to delete this trip', 403));
    }
    await Trip.findByIdAndDelete(req.params.id);
    res.status(204).json({ status: 'success', data: null });
  } catch (err) {
    next(err);
  }
};

// ══════════════════════════════════════════════════════════════
// PARTICIPANT MANAGEMENT
// ══════════════════════════════════════════════════════════════

// ── REQUEST TO JOIN ───────────────────────────────────────────
export const requestToJoin = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.status !== 'active') return next(new AppError('Trip is not active', 400));

    // Can't join own trip
    if (trip.creator.toString() === req.user._id.toString()) {
      return next(new AppError('You are the creator of this trip', 400));
    }

    // Check if already a participant
    const existing = trip.participants.find(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (existing) {
      return next(new AppError(`You already have a ${existing.status} request`, 400));
    }

    // Check spots
    const accepted = trip.participants.filter((p) => p.status === 'accepted').length;
    if (accepted >= trip.maxParticipants - 1) {
      return next(new AppError('Trip is full', 400));
    }

    trip.participants.push({
      user: req.user._id,
      status: 'requested',
      joinedAt: new Date(),
    });

    await trip.save();

    // Create notification for trip creator
    try {
      const { Notification } = await import('../models/notificationModel.js');
      const senderProfile = await Profile.findOne({ user: req.user._id });
      await Notification.create({
        recipient: trip.creator,
        sender: req.user._id,
        type: 'join_request',
        tripId: trip._id,
        message: `${senderProfile?.displayName || 'Someone'} requested to join "${trip.title}"`,
      });
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(200).json({
      status: 'success',
      message: 'Join request sent!',
    });
  } catch (err) {
    next(err);
  }
};

// ── ACCEPT PARTICIPANT ────────────────────────────────────────
export const acceptParticipant = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the creator can manage participants', 403));
    }

    const participant = trip.participants.find(
      (p) => p.user.toString() === req.params.participantUserId
    );
    if (!participant) return next(new AppError('Participant not found', 404));
    if (participant.status === 'accepted') return next(new AppError('Already accepted', 400));

    participant.status = 'accepted';
    await trip.save();

    // Notify the accepted user
    try {
      const { Notification } = await import('../models/notificationModel.js');
      await Notification.create({
        recipient: participant.user,
        sender: req.user._id,
        type: 'request_accepted',
        tripId: trip._id,
        message: `Your request to join "${trip.title}" was accepted!`,
      });
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Participant accepted' });
  } catch (err) {
    next(err);
  }
};

// ── DECLINE PARTICIPANT ───────────────────────────────────────
export const declineParticipant = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the creator can manage participants', 403));
    }

    const participant = trip.participants.find(
      (p) => p.user.toString() === req.params.participantUserId
    );
    if (!participant) return next(new AppError('Participant not found', 404));

    participant.status = 'declined';
    await trip.save();

    // Notify the declined user
    try {
      const { Notification } = await import('../models/notificationModel.js');
      await Notification.create({
        recipient: participant.user,
        sender: req.user._id,
        type: 'request_declined',
        tripId: trip._id,
        message: `Your request to join "${trip.title}" was declined.`,
      });
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Request declined' });
  } catch (err) {
    next(err);
  }
};

// ── REMOVE PARTICIPANT ────────────────────────────────────────
export const removeParticipant = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));
    if (trip.creator.toString() !== req.user._id.toString()) {
      return next(new AppError('Only the creator can remove participants', 403));
    }

    const idx = trip.participants.findIndex(
      (p) => p.user.toString() === req.params.participantUserId
    );
    if (idx === -1) return next(new AppError('Participant not found', 404));

    const removedUser = trip.participants[idx].user;
    trip.participants.splice(idx, 1);
    await trip.save();

    // Notify the removed user
    try {
      const { Notification } = await import('../models/notificationModel.js');
      await Notification.create({
        recipient: removedUser,
        sender: req.user._id,
        type: 'participant_removed',
        tripId: trip._id,
        message: `You were removed from "${trip.title}".`,
      });
    } catch (e) {
      console.error('Notification error:', e.message);
    }

    res.status(200).json({ status: 'success', message: 'Participant removed' });
  } catch (err) {
    next(err);
  }
};

// ── LEAVE TRIP ────────────────────────────────────────────────
export const leaveTrip = async (req, res, next) => {
  try {
    const trip = await Trip.findById(req.params.id);
    if (!trip) return next(new AppError('Trip not found', 404));

    const idx = trip.participants.findIndex(
      (p) => p.user.toString() === req.user._id.toString()
    );
    if (idx === -1) return next(new AppError('You are not a participant', 400));

    trip.participants.splice(idx, 1);
    await trip.save();

    res.status(200).json({ status: 'success', message: 'Left the trip' });
  } catch (err) {
    next(err);
  }
};
