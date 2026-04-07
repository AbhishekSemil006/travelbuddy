import { Conversation } from '../models/conversationModel.js';
import { Message } from '../models/messageModel.js';
import { Profile } from '../models/profileModel.js';
import { Notification } from '../models/notificationModel.js';
import { AppError } from '../utils/appError.js';

// Helper to get "other user" profile for a conversation
const getOtherUserProfile = async (conversation, currentUserId) => {
  const otherId = conversation.participants.find(
    (p) => p.toString() !== currentUserId.toString()
  );
  if (!otherId) return null;

  const profile = await Profile.findOne({ user: otherId });
  return {
    user_id: otherId.toString(),
    display_name: profile?.displayName || 'Unknown',
    avatar_url: profile?.avatarUrl || null,
  };
};

// ── GET CONVERSATIONS ─────────────────────────────────────────
export const getConversations = async (req, res, next) => {
  try {
    const conversations = await Conversation.find({
      participants: req.user._id,
    })
      .sort('-updatedAt')
      .lean();

    // Enrich with other user profile and unread counts
    const enriched = await Promise.all(
      conversations.map(async (conv) => {
        const otherId = conv.participants.find(
          (p) => p.toString() !== req.user._id.toString()
        );

        const profile = otherId
          ? await Profile.findOne({ user: otherId }).lean()
          : null;

        const unreadCount = await Message.countDocuments({
          conversation: conv._id,
          sender: { $ne: req.user._id },
          isRead: false,
        });

        return {
          id: conv._id.toString(),
          participant_one: conv.participants[0]?.toString(),
          participant_two: conv.participants[1]?.toString(),
          created_at: conv.createdAt,
          updated_at: conv.updatedAt,
          other_user: profile
            ? {
                user_id: otherId.toString(),
                display_name: profile.displayName || 'Unknown',
                avatar_url: profile.avatarUrl || null,
              }
            : { user_id: otherId?.toString(), display_name: 'Unknown', avatar_url: null },
          last_message: conv.lastMessage?.content
            ? {
                content: conv.lastMessage.content,
                created_at: conv.lastMessage.createdAt,
                sender_id: conv.lastMessage.sender?.toString(),
                is_read: true, // simplified
              }
            : null,
          unread_count: unreadCount,
        };
      })
    );

    res.status(200).json({ status: 'success', data: enriched });
  } catch (err) {
    next(err);
  }
};

// ── START CONVERSATION ────────────────────────────────────────
export const startConversation = async (req, res, next) => {
  try {
    const { otherUserId } = req.body;
    if (!otherUserId) return next(new AppError('otherUserId is required', 400));
    if (otherUserId === req.user._id.toString()) {
      return next(new AppError('Cannot start conversation with yourself', 400));
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      participants: { $all: [req.user._id, otherUserId] },
    });

    if (!conversation) {
      conversation = await Conversation.create({
        participants: [req.user._id, otherUserId],
      });
    }

    res.status(200).json({
      status: 'success',
      data: { conversationId: conversation._id.toString() },
    });
  } catch (err) {
    next(err);
  }
};

// ── GET MESSAGES ──────────────────────────────────────────────
export const getMessages = async (req, res, next) => {
  try {
    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return next(new AppError('Conversation not found', 404));

    // Verify user is a participant
    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return next(new AppError('Not authorized', 403));

    const messages = await Message.find({ conversation: conversation._id })
      .sort('createdAt')
      .limit(200)
      .lean();

    // Map to frontend format
    const mapped = messages.map((m) => ({
      id: m._id.toString(),
      conversation_id: m.conversation.toString(),
      sender_id: m.sender.toString(),
      content: m.content,
      is_read: m.isRead,
      created_at: m.createdAt,
    }));

    res.status(200).json({ status: 'success', data: mapped });
  } catch (err) {
    next(err);
  }
};

// ── SEND MESSAGE ──────────────────────────────────────────────
export const sendMessage = async (req, res, next) => {
  try {
    const { content } = req.body;
    if (!content || !content.trim()) {
      return next(new AppError('Message content is required', 400));
    }

    const conversation = await Conversation.findById(req.params.conversationId);
    if (!conversation) return next(new AppError('Conversation not found', 404));

    const isParticipant = conversation.participants.some(
      (p) => p.toString() === req.user._id.toString()
    );
    if (!isParticipant) return next(new AppError('Not authorized', 403));

    const message = await Message.create({
      conversation: conversation._id,
      sender: req.user._id,
      content: content.trim(),
    });

    // Update conversation's lastMessage
    conversation.lastMessage = {
      content: content.trim(),
      sender: req.user._id,
      createdAt: new Date(),
    };
    await conversation.save();

    // Create notification for the other user
    const otherId = conversation.participants.find(
      (p) => p.toString() !== req.user._id.toString()
    );
    if (otherId) {
      try {
        const senderProfile = await Profile.findOne({ user: req.user._id });
        await Notification.create({
          recipient: otherId,
          sender: req.user._id,
          type: 'new_message',
          message: `${senderProfile?.displayName || 'Someone'}: ${content.trim().substring(0, 50)}`,
        });
      } catch (e) {
        // Don't fail the message send if notification fails
      }
    }

    res.status(201).json({
      status: 'success',
      data: {
        id: message._id.toString(),
        conversation_id: message.conversation.toString(),
        sender_id: message.sender.toString(),
        content: message.content,
        is_read: message.isRead,
        created_at: message.createdAt,
      },
    });
  } catch (err) {
    next(err);
  }
};

// ── MARK MESSAGES READ ────────────────────────────────────────
export const markMessagesRead = async (req, res, next) => {
  try {
    await Message.updateMany(
      {
        conversation: req.params.conversationId,
        sender: { $ne: req.user._id },
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ status: 'success' });
  } catch (err) {
    next(err);
  }
};
