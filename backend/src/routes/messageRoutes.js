import express from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
  reportConversation,
  blockUser,
  unblockUser,
  getBlockStatus,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/start', startConversation);

// Block / unblock
router.post('/block/:userId', blockUser);
router.post('/unblock/:userId', unblockUser);
router.get('/block-status/:userId', getBlockStatus);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.patch('/:conversationId/read', markMessagesRead);
router.post('/:conversationId/report', reportConversation);

export default router;
