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

const router = express.Router();

// Protect all admin routes
router.use(protect);
router.use(restrictTo('admin'));

// Dashboard stats
router.get('/dashboard', getDashboardStats);

// Users
router.get('/users', getAllUsers);
router.patch('/users/:id/block', toggleUserBlock);
router.delete('/users/:id', deleteUser);
router.patch('/users/:id/fine', fineUser);
router.patch('/users/:id/verify', verifyUser);

// Trips
router.get('/trips', getAllTrips);
router.get('/trips/:id', getTripDetails);
router.patch('/trips/:id', updateTrip);
router.delete('/trips/:id', deleteTrip);

// Reports
router.get('/reports', getReports);
router.patch('/reports/:id', updateReportStatus);

// Audit Logs
router.get('/audit', getAuditLogs);

export default router;