import express from 'express';
import {
  getDashboardStats,
  getAllUsers,
  toggleUserBlock,
  deleteUser,
  fineUser,
  verifyUser, 
  getAllTrips,
  getTripDetails,
  updateTrip,
  deleteTrip,
  getAuditLogs,
  getReports,
  updateReportStatus,
} from '../controllers/adminController.js';

import { protect, restrictTo } from '../middleware/authMiddleware.js';
import { validate } from '../middleware/validateRequest.js';
import { adminFineSchema, adminReportStatusSchema, adminUpdateTripSchema } from '../utils/validators.js';
import { validateObjectIdParams } from '../utils/sanitize.js';

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/block', validateObjectIdParams('id'), toggleUserBlock);
router.delete('/users/:id', validateObjectIdParams('id'), deleteUser);
router.patch('/users/:id/fine', validateObjectIdParams('id'), validate(adminFineSchema), fineUser);
router.patch('/users/:id/verify', validateObjectIdParams('id'), verifyUser);

// Trips
router.get('/trips', getAllTrips);
router.get('/trips/:id', validateObjectIdParams('id'), getTripDetails);
router.patch('/trips/:id', validateObjectIdParams('id'), validate(adminUpdateTripSchema), updateTrip);
router.delete('/trips/:id', validateObjectIdParams('id'), deleteTrip);

// Reports
router.get('/reports', getReports);
router.patch('/reports/:id', validateObjectIdParams('id'), validate(adminReportStatusSchema), updateReportStatus);

// Audit Logs
router.get('/audit', getAuditLogs);

export default router;