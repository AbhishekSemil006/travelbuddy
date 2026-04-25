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
import { validate } from '../middleware/validateRequest.js';
import { sendMessageSchema, startConversationSchema, reportConversationSchema } from '../utils/validators.js';
import { validateObjectIdParams } from '../utils/sanitize.js';

const router = express.Router();

router.use(protect);

router.get('/conversations', getConversations);
router.post('/start', validate(startConversationSchema), startConversation);

// Block / unblock
router.post('/block/:userId', validateObjectIdParams('userId'), blockUser);
router.post('/unblock/:userId', validateObjectIdParams('userId'), unblockUser);
router.get('/block-status/:userId', validateObjectIdParams('userId'), getBlockStatus);

router.get('/:conversationId', validateObjectIdParams('conversationId'), getMessages);
router.post('/:conversationId', validateObjectIdParams('conversationId'), validate(sendMessageSchema), sendMessage);
router.patch('/:conversationId/read', validateObjectIdParams('conversationId'), markMessagesRead);
router.post('/:conversationId/report', validateObjectIdParams('conversationId'), validate(reportConversationSchema), reportConversation);

export default router;
