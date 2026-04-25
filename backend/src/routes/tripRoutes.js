import express from 'express';
import {
  getAllTrips, createTrip, getTrip, updateTrip, deleteTrip,
  requestToJoin, acceptParticipant, declineParticipant, removeParticipant, leaveTrip,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { createTripSchema, updateTripSchema } from '../utils/validators.js';
import { validateObjectIdParams } from '../utils/sanitize.js';

export const tripRouter = express.Router();

tripRouter
  .route('/')
  .get(getAllTrips)
  .post(protect, validate(createTripSchema), createTrip);

tripRouter
  .route('/:id')
  .get(validateObjectIdParams('id'), getTrip)
  .patch(protect, validateObjectIdParams('id'), validate(updateTripSchema), updateTrip)
  .delete(protect, validateObjectIdParams('id'), deleteTrip);

// Participant management
tripRouter.post('/:id/join', protect, validateObjectIdParams('id'), requestToJoin);
tripRouter.patch('/:id/participants/:participantUserId/accept', protect, validateObjectIdParams('id', 'participantUserId'), acceptParticipant);
tripRouter.patch('/:id/participants/:participantUserId/decline', protect, validateObjectIdParams('id', 'participantUserId'), declineParticipant);
tripRouter.delete('/:id/participants/:participantUserId', protect, validateObjectIdParams('id', 'participantUserId'), removeParticipant);
tripRouter.delete('/:id/leave', protect, validateObjectIdParams('id'), leaveTrip);

export default tripRouter;
