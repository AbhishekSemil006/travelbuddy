import express from 'express';
import {
  getConversations,
  startConversation,
  getMessages,
  sendMessage,
  markMessagesRead,
} from '../controllers/messageController.js';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/start', startConversation);

router.get('/:conversationId', getMessages);
router.post('/:conversationId', sendMessage);
router.patch('/:conversationId/read', markMessagesRead);

export default router;
