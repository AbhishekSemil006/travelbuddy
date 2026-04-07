import { Notification } from '../models/notificationModel.js';
import { Profile } from '../models/profileModel.js';

// GET /notifications — get my notifications
export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort('-createdAt')
      .limit(50)
      .lean();

    // Attach sender profiles
    const senderIds = [...new Set(notifications.filter((n) => n.sender).map((n) => n.sender.toString()))];
    const profiles = await Profile.find({ user: { $in: senderIds } }).lean();
    const profileMap = {};
    profiles.forEach((p) => {
      profileMap[p.user.toString()] = {
        displayName: p.displayName,
        avatarUrl: p.avatarUrl || null,
      };
    });

    const enriched = notifications.map((n) => ({
      ...n,
      senderProfile: n.sender ? profileMap[n.sender.toString()] || null : null,
    }));

    const unreadCount = enriched.filter((n) => !n.isRead).length;

    res.status(200).json({
      status: 'success',
      unreadCount,
      data: enriched,
    });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/:id/read — mark one as read
export const markAsRead = async (req, res, next) => {
  try {
    const notification = await Notification.findOneAndUpdate(
      { _id: req.params.id, recipient: req.user._id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ status: 'fail', message: 'Notification not found' });
    }

    res.status(200).json({ status: 'success', data: notification });
  } catch (err) {
    next(err);
  }
};

// PATCH /notifications/read-all — mark all as read
export const markAllAsRead = async (req, res, next) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, isRead: false },
      { isRead: true }
    );

    res.status(200).json({ status: 'success', message: 'All notifications marked as read' });
  } catch (err) {
    next(err);
  }
};
