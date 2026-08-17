import express from 'express';
import { getMyWorkload, getTeamWorkload, updateWellbeing } from '../controllers/workload.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect); // All workload routes require authentication

router.get('/my-workload', getMyWorkload);
router.post('/wellbeing', updateWellbeing);

// Manager only routes
router.use(restrictTo('Manager', 'SuperAdmin', 'HRAdmin'));
router.get('/team', getTeamWorkload);

export default router;
