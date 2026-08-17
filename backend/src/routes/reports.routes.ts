import { Router } from 'express';
import * as ReportsController from '../controllers/reports.controller';
import { protect, restrictTo } from '../middlewares/auth.middleware';

const router = Router();

// Protect all reports routes, allow SuperAdmin, HRAdmin, and Manager
router.use(protect);
router.use(restrictTo('SuperAdmin', 'HRAdmin', 'Manager'));

router.get('/dashboard', ReportsController.getDashboardData);
router.get('/attendance', ReportsController.getAttendanceReport);
router.get('/leave', ReportsController.getLeaveReport);
router.get('/department', ReportsController.getDepartmentReport);
router.get('/employee', ReportsController.getEmployeeReport);
router.get('/project', ReportsController.getProjectReport);
router.get('/skills', ReportsController.getSkillsReport);
router.get('/certification', ReportsController.getCertificationReport);

export default router;
