import express from 'express';
import { getRecentActivities } from '../controllers/activity.controller';
import { protect } from '../middlewares/auth.middleware';

const router = express.Router();

// Apply protection middleware to all activity routes
router.use(protect);

router.get('/', getRecentActivities);

export default router;
