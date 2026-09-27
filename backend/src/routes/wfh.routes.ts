import express from 'express';
import {
  createWFHRequest,
  getMyWFHRequests,
  getTeamWFHRequests,
  getAllWFHRequests,
  updateWFHRequestStatus,
  getWFHCalendar
} from '../controllers/wfh.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// All routes require authentication
router.use(protect);

// Employee routes
router.route('/my-requests')
  .get(getMyWFHRequests)
  .post(createWFHRequest);

// Calendar route (access differs by role in controller)
router.get('/calendar', getWFHCalendar);

// Manager routes
router.get('/team', restrictTo('Manager'), getTeamWFHRequests);

// HR/Admin routes
router.get('/all', restrictTo('HRAdmin', 'SuperAdmin'), getAllWFHRequests);

// Common update route for Manager/HR/Admin
router.patch('/:id/status', restrictTo('Manager', 'HRAdmin', 'SuperAdmin', 'Employee'), updateWFHRequestStatus);

export default router;
