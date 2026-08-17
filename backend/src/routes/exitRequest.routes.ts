import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  submitResignation,
  getMyResignation,
  getTeamResignations,
  managerReview,
  getAllResignations,
  hrReview,
  updateClearance,
  scheduleExitInterview,
  completeExitInterview,
  completeExit
} from '../controllers/exitRequest.controller';

const router = express.Router();

router.use(protect);

// Employee routes
router.post('/', submitResignation);
router.get('/my', getMyResignation);

// Manager routes
router.get('/team', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), getTeamResignations);
router.put('/:id/manager-review', restrictTo('Manager', 'SuperAdmin', 'HRAdmin'), managerReview);

// HR Admin routes
router.use(restrictTo('HRAdmin', 'SuperAdmin'));

router.get('/', getAllResignations);
router.put('/:id/hr-review', hrReview);
router.put('/:id/clearance', updateClearance);
router.put('/:id/exit-interview', scheduleExitInterview);
router.put('/:id/exit-interview/complete', completeExitInterview);
router.put('/:id/complete', completeExit);

export default router;
