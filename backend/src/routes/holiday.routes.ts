import express from 'express';
import {
  createHoliday,
  getHolidays,
  updateHoliday,
  deleteHoliday
} from '../controllers/holiday.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = express.Router();

// All holiday routes are protected
router.use(protect);

// Prevent Candidates from accessing internal holidays
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager', 'Employee'));

router
  .route('/')
  .get(getHolidays)
  .post(restrictTo('SuperAdmin', 'HRAdmin'), createHoliday);

router
  .route('/:id')
  .put(restrictTo('SuperAdmin', 'HRAdmin'), updateHoliday)
  .delete(restrictTo('SuperAdmin', 'HRAdmin'), deleteHoliday);

export default router;
