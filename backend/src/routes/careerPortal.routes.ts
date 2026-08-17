import { Router } from 'express';
import { applyForJob, getDashboardData, getMyApplications, withdrawApplication, getSavedJobs, toggleSavedJob } from '../controllers/careerPortal.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';
import { upload } from '../middlewares/upload.middleware';

const router = Router();

// All career portal routes require authentication
router.use(protect);
router.use(restrictTo('Candidate'));

router.post('/apply/:jobId', upload.single('resume'), applyForJob);
router.get('/dashboard', getDashboardData);
router.get('/my-applications', getMyApplications);
router.put('/my-applications/:id/withdraw', withdrawApplication);

// Saved Jobs routes
router.get('/saved-jobs', getSavedJobs);
router.post('/saved-jobs/:jobId', toggleSavedJob);

export default router;
