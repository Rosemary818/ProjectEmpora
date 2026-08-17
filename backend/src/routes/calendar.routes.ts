import express from 'express';
import { getCalendarData } from '../controllers/calendar.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

router.use(protect);
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router.get('/', getCalendarData);

export default router;
