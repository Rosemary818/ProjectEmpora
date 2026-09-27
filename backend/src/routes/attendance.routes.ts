import { Router } from 'express';
import * as AttendanceController from '../controllers/attendance.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// All attendance routes require authentication
router.use(protect);

router.post('/check-in', restrictTo('Employee', 'ServiceExecutive', 'Manager', 'HRAdmin', 'SuperAdmin'), AttendanceController.checkIn);
router.post('/check-out', restrictTo('Employee', 'ServiceExecutive', 'Manager', 'HRAdmin', 'SuperAdmin'), AttendanceController.checkOut);
router.get('/my-attendance', restrictTo('Employee', 'ServiceExecutive', 'Manager', 'HRAdmin', 'SuperAdmin'), AttendanceController.getMyAttendance);
router.get('/team-attendance', restrictTo('Manager'), AttendanceController.getTeamAttendance);
router.get('/all-attendance', restrictTo('HRAdmin', 'SuperAdmin'), AttendanceController.getAllAttendance);

export default router;
