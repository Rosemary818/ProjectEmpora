import { Router } from 'express';
import {
  createJob,
  getJobs,
  getPublishedJobs,
  getJobById,
  updateJob,
  deleteJob,
  getJobStats,
  getAllApplications,
  updateApplicationStatus,
  resendWelcomeEmail
} from '../controllers/job.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Public / Portal routes
router.get('/published', getPublishedJobs);

// HR Admin routes (protected)
router.use(protect);
router.use(restrictTo('HRAdmin', 'SuperAdmin'));

router.get('/stats', getJobStats);
router.get('/', getJobs);
router.post('/', createJob);
router.get('/applications', getAllApplications);
router.put('/applications/:id/status', updateApplicationStatus);
router.post('/applications/:id/resend-welcome', resendWelcomeEmail);

router.get('/:id', getJobById);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);

export default router;
