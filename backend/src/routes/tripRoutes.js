import express from 'express';
import {
  getAllTrips, createTrip, getTrip, updateTrip, deleteTrip,
  requestToJoin, acceptParticipant, declineParticipant, removeParticipant, leaveTrip,
} from '../controllers/tripController.js';
import { protect } from '../middleware/authMiddleware.js';

export const tripRouter = express.Router();

tripRouter
  .route('/')
  .get(getAllTrips)
  .post(protect, createTrip);

tripRouter
  .route('/:id')
  .get(getTrip)
  .patch(protect, updateTrip)
  .delete(protect, deleteTrip);

// Participant management
tripRouter.post('/:id/join', protect, requestToJoin);
tripRouter.patch('/:id/participants/:participantUserId/accept', protect, acceptParticipant);
tripRouter.patch('/:id/participants/:participantUserId/decline', protect, declineParticipant);
tripRouter.delete('/:id/participants/:participantUserId', protect, removeParticipant);
tripRouter.delete('/:id/leave', protect, leaveTrip);

export default tripRouter;
