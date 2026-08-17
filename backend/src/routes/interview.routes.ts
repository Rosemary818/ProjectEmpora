import express from 'express';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import {
  scheduleInterview,
  getHRInterviews,
  getCandidateInterviews,
  updateInterview,
  cancelInterview,
  getHRDashboardWidgets,
  getCandidateDashboardWidgets,
  getManagerInterviews,
  submitFeedback,
  hrDecision
} from '../controllers/interview.controller';

const router = express.Router();

router.use(protect);

router.get('/candidate', getCandidateInterviews);
router.get('/candidate/widgets', getCandidateDashboardWidgets);

router.post('/', restrictTo('HRAdmin', 'SuperAdmin'), scheduleInterview);
router.get('/hr', restrictTo('HRAdmin', 'SuperAdmin'), getHRInterviews);
router.get('/hr/widgets', restrictTo('HRAdmin', 'SuperAdmin'), getHRDashboardWidgets);
router.put('/:id', restrictTo('HRAdmin', 'SuperAdmin'), updateInterview);
router.post('/:id/cancel', restrictTo('HRAdmin', 'SuperAdmin'), cancelInterview);
router.put('/:id/hr-decision', restrictTo('HRAdmin', 'SuperAdmin'), hrDecision);

router.get('/manager', restrictTo('Manager', 'SuperAdmin'), getManagerInterviews);
router.put('/:id/feedback', restrictTo('Manager', 'SuperAdmin'), submitFeedback);

export default router;
