import { Router } from 'express';
import * as TimesheetController from '../controllers/timesheet.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// All timesheet routes require authentication
router.use(protect);

// Employee routes
router.post('/', TimesheetController.createTimesheet);
router.get('/my-timesheets', TimesheetController.getMyTimesheets);
router.patch('/:id', TimesheetController.updateTimesheet);
router.post('/:id/submit', TimesheetController.submitTimesheet);

// Manager / Admin routes
router.get('/team', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TimesheetController.getTeamTimesheets);
router.patch('/:id/review', restrictTo('HRAdmin', 'Manager', 'SuperAdmin'), TimesheetController.reviewTimesheet);

export default router;
